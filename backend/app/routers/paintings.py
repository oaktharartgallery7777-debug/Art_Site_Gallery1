"""Paintings: public browsing + admin CRUD."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from pydantic import BaseModel

from app.core.security import require_admin
from app.db.supabase_client import get_supabase
from app.services import cloudinary_service

router = APIRouter(prefix="/api/paintings", tags=["paintings"])

ITEMS_PER_PAGE = 9
MAX_FILE_SIZE = 20 * 1024 * 1024
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}


class PaintingCreate(BaseModel):
    id: str
    title: str = ""
    artist: str = ""
    width: float | None = None
    height: float | None = None
    unit: str = "in"
    medium: str = ""
    location: str = ""
    draw_year: str = ""
    purchase_year: str = ""
    price: str = ""


class PaintingUpdate(BaseModel):
    title: str | None = None
    artist: str | None = None
    width: float | None = None
    height: float | None = None
    unit: str | None = None
    medium: str | None = None
    location: str | None = None
    draw_year: str | None = None
    purchase_year: str | None = None
    price: str | None = None


def _log(action: str, artwork_id: str, details: str = "") -> None:
    try:
        get_supabase().table("activity_logs").insert({
            "action": action,
            "artwork_id": artwork_id,
            "details": details,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception:
        pass


def _apply_filters(query, search: str | None, artist: str | None,
                   location: str | None, medium: str | None):
    if search:
        # supabase-py or_: match id/title/artist
        query = query.or_(f"id.ilike.%{search}%,title.ilike.%{search}%,artist.ilike.%{search}%")
    if artist:
        query = query.eq("artist", artist)
    if location:
        query = query.eq("location", location)
    if medium:
        query = query.eq("medium", medium)
    return query


@router.get("")
def list_paintings(
    page: int = Query(1, ge=1),
    per_page: int = Query(ITEMS_PER_PAGE, ge=1, le=60),
    search: str | None = None,
    artist: str | None = None,
    location: str | None = None,
    medium: str | None = None,
):
    sb = get_supabase()
    query = sb.table("paintings").select("*", count="exact")
    query = _apply_filters(query, search, artist, location, medium)
    start = (page - 1) * per_page
    res = query.order("id").range(start, start + per_page - 1).execute()
    total = res.count or 0
    return {
        "items": res.data,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, -(-total // per_page)),
    }


@router.get("/filter-options")
def filter_options():
    sb = get_supabase()
    artists = sb.table("paintings").select("artist").execute()
    locations = sb.table("paintings").select("location").execute()
    mediums = sb.table("paintings").select("medium").execute()
    uniq = lambda rows, key: sorted({r[key] for r in rows.data if r.get(key)})
    return {
        "artists": uniq(artists, "artist"),
        "locations": uniq(locations, "location"),
        "mediums": uniq(mediums, "medium"),
    }


@router.get("/{painting_id}")
def get_painting(painting_id: str):
    res = get_supabase().table("paintings").select("*").eq("id", painting_id).execute()
    if not res.data:
        raise HTTPException(404, "Artwork not found.")
    return res.data[0]


@router.post("", dependencies=[Depends(require_admin)])
def create_painting(
    id: str = Form(...),
    title: str = Form(""),
    artist: str = Form(""),
    width: float | None = Form(None),
    height: float | None = Form(None),
    unit: str = Form("in"),
    medium: str = Form(""),
    location: str = Form(""),
    draw_year: str = Form(""),
    purchase_year: str = Form(""),
    price: str = Form(""),
    image: UploadFile | None = File(default=None),
):
    sb = get_supabase()
    existing = sb.table("paintings").select("id").eq("id", id).execute()
    if existing.data:
        raise HTTPException(400, f"ID {id} already exists.")

    image_url = ""
    if image is not None:
        content = image.file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(400, "Image exceeds 20 MB.")
        image_url = cloudinary_service.upload_image(content, image.filename or f"{id}.jpg") or ""
        if not image_url:
            raise HTTPException(500, "Image upload failed.")

    sb.table("paintings").insert({
        "id": id, "title": title, "artist": artist,
        "width": width, "height": height, "unit": unit,
        "medium": medium, "location": location,
        "image_url": image_url, "draw_year": draw_year,
        "purchase_year": purchase_year, "price": price,
    }).execute()
    _log("ADD", id, f"Title: {title} | Artist: {artist}")
    return {"ok": True, "id": id}


@router.put("/{painting_id}", dependencies=[Depends(require_admin)])
def update_painting(painting_id: str, payload: PaintingUpdate):
    sb = get_supabase()
    existing = sb.table("paintings").select("*").eq("id", painting_id).execute()
    if not existing.data:
        raise HTTPException(404, "Artwork not found.")
    changes = {k: v for k, v in payload.model_dump().items() if v is not None}
    if changes:
        sb.table("paintings").update(changes).eq("id", painting_id).execute()
        _log("UPDATE", painting_id, f"Fields: {', '.join(changes.keys())}")
    return {"ok": True}


@router.delete("/{painting_id}", dependencies=[Depends(require_admin)])
def delete_painting(painting_id: str):
    sb = get_supabase()
    existing = sb.table("paintings").select("*").eq("id", painting_id).execute()
    if not existing.data:
        raise HTTPException(404, "Artwork not found.")
    image_url = existing.data[0].get("image_url") or ""
    sb.table("paintings").delete().eq("id", painting_id).execute()
    if image_url:
        cloudinary_service.delete_image(image_url)
    _log("DELETE", painting_id, "Artwork deleted.")
    return {"ok": True}


@router.post("/{painting_id}/replace-image", dependencies=[Depends(require_admin)])
def replace_image(painting_id: str, image: UploadFile = File(...)):
    sb = get_supabase()
    existing = sb.table("paintings").select("*").eq("id", painting_id).execute()
    if not existing.data:
        raise HTTPException(404, "Artwork not found.")
    content = image.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "Image exceeds 20 MB.")
    new_url = cloudinary_service.upload_image(content, image.filename or f"{painting_id}.jpg")
    if not new_url:
        raise HTTPException(500, "Image upload failed.")
    old_url = existing.data[0].get("image_url") or ""
    sb.table("paintings").update({"image_url": new_url}).eq("id", painting_id).execute()
    if old_url and old_url != new_url:
        cloudinary_service.delete_image(old_url)
    _log("REPLACE_IMAGE", painting_id, "Image replaced.")
    return {"ok": True, "image_url": new_url}


@router.post("/batch-location", dependencies=[Depends(require_admin)])
def batch_location_update(payload: dict):
    ids: list = payload.get("artwork_ids", [])
    new_location: str = payload.get("new_location", "").strip()
    if not ids or not new_location:
        raise HTTPException(400, "artwork_ids and new_location are required.")
    sb = get_supabase()
    res = sb.table("paintings").update({"location": new_location}).in_("id", ids).execute()
    count = len(res.data or [])
    _log("BATCH_LOCATION", ",".join(ids[:5]), f"{count} artworks -> {new_location}")
    return {"ok": True, "updated": count}
