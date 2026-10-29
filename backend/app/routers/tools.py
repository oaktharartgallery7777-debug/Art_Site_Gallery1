"""Admin tools: QR codes, printable labels, bulk CSV import."""

from __future__ import annotations

import html
from io import BytesIO, StringIO

import pandas as pd
import qrcode
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import Response, StreamingResponse
from fpdf import FPDF

from app.core.config import settings
from app.core.security import require_admin
from app.db.supabase_client import get_supabase
from app.routers.paintings import _log

router = APIRouter(prefix="/api/tools", tags=["tools"])

REQUIRED_COLUMNS = {"id", "title", "artist", "width", "height", "unit", "medium",
                    "location", "draw_year", "purchase_year", "price", "image_url"}


def _qr_bytes(artwork_id: str) -> tuple[bytes, str]:
    # QR codes point at the image-only endpoint, not the gallery page:
    # scanning one must show just the artwork's image.
    base = settings.PUBLIC_APP_URL or ""
    path = f"/api/paintings/{artwork_id}/image"
    qr_url = f"{base}{path}" if base else path
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue(), qr_url


@router.get("/qr/{artwork_id}")
def qr_code(artwork_id: str, _: str = Depends(require_admin)):
    data, _ = _qr_bytes(artwork_id)
    return Response(content=data, media_type="image/png")


@router.get("/qr/{artwork_id}/public")
def qr_code_public(artwork_id: str):
    """Public QR endpoint (used by label PDFs)."""
    data, _ = _qr_bytes(artwork_id)
    return Response(content=data, media_type="image/png")


@router.get("/labels.pdf", dependencies=[Depends(require_admin)])
def print_labels(ids: str = Query("", description="comma-separated artwork ids; empty = all")):
    sb = get_supabase()
    query = sb.table("paintings").select("*")
    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    if id_list:
        query = query.in_("id", id_list)
    rows = query.order("id").execute().data or []
    if not rows:
        raise HTTPException(404, "No artworks found.")

    pdf = FPDF(format="A4")
    pdf.set_auto_page_break(True, margin=15)
    for row in rows:
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 20)
        pdf.cell(0, 12, f"ID  {row.get('id', '')}", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 14)
        pdf.cell(0, 9, str(row.get("title") or "Unknown"), new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 8, f"by {row.get('artist') or 'Unknown'}", new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(0, 0, 0)
        pdf.ln(4)
        for label, key in (("Year", "draw_year"), ("Acquired", "purchase_year"),
                           ("Price", "price"), ("Medium", "medium"), ("Location", "location")):
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(30, 7, f"{label}:")
            pdf.set_font("Helvetica", "", 11)
            pdf.cell(0, 7, str(row.get(key) or "N/A"), new_x="LMARGIN", new_y="NEXT")
        w, h, unit = row.get("width"), row.get("height"), row.get("unit") or "in"
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(30, 7, "Size:")
        pdf.set_font("Helvetica", "", 11)
        pdf.cell(0, 7, f"{w} x {h} {unit}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(6)
        qr_data, _ = _qr_bytes(str(row.get("id")))
        qr_path = f"/tmp/qr_{row.get('id')}.png"
        with open(qr_path, "wb") as f:
            f.write(qr_data)
        pdf.image(qr_path, x=80, w=50)
    out = pdf.output()
    return StreamingResponse(iter([bytes(out)]), media_type="application/pdf",
                             headers={"Content-Disposition": "attachment; filename=art-labels.pdf"})


@router.post("/bulk-import", dependencies=[Depends(require_admin)])
def bulk_import(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Please upload a CSV file.")
    try:
        df = pd.read_csv(BytesIO(file.file.read()), dtype=str).fillna("")
    except Exception as e:
        raise HTTPException(400, f"Could not parse CSV: {e}")

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(400, f"Missing columns: {', '.join(sorted(missing))}")

    sb = get_supabase()
    existing_ids = {r["id"] for r in sb.table("paintings").select("id").execute().data or []}

    added, skipped = 0, []
    for _, r in df.iterrows():
        pid = str(r["id"]).strip()
        if not pid:
            continue
        if pid in existing_ids:
            skipped.append(pid)
            continue
        sb.table("paintings").insert({
            "id": pid, "title": str(r["title"]).strip(), "artist": str(r["artist"]).strip(),
            "width": _num(r["width"]), "height": _num(r["height"]),
            "unit": str(r["unit"]).strip() or "in", "medium": str(r["medium"]).strip(),
            "location": str(r["location"]).strip(), "image_url": str(r["image_url"]).strip(),
            "draw_year": str(r["draw_year"]).strip(),
            "purchase_year": str(r["purchase_year"]).strip(),
            "price": str(r["price"]).strip(),
        }).execute()
        existing_ids.add(pid)
        added += 1
    _log("BULK_IMPORT", f"{added} items", f"Added {added}, skipped {len(skipped)} existing.")
    return {"ok": True, "added": added, "skipped": skipped}


def _num(v: str) -> float | None:
    try:
        return float(v) if str(v).strip() else None
    except ValueError:
        return None


@router.get("/import-template")
def import_template(_: str = Depends(require_admin)):
    header = "id,title,artist,width,height,unit,medium,location,draw_year,purchase_year,price,image_url\n"
    return Response(content=header, media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=bulk-import-template.csv"})
