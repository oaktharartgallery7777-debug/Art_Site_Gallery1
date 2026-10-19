"""Analytics: collection stats for the admin dashboard."""

from collections import Counter

from fastapi import APIRouter, Depends

from app.core.security import require_admin
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/api/analytics", tags=["analytics"],
                   dependencies=[Depends(require_admin)])


@router.get("")
def analytics():
    rows = get_supabase().table("paintings").select(
        "id,artist,medium,location,draw_year,purchase_year,price"
    ).execute().data or []

    by_artist = Counter(r.get("artist") or "Unknown" for r in rows)
    by_medium = Counter(r.get("medium") or "Unknown" for r in rows)
    by_location = Counter(r.get("location") or "Unknown" for r in rows)
    by_year = Counter(str(r.get("draw_year") or "Unknown") for r in rows)

    return {
        "total_artworks": len(rows),
        "total_artists": len({r.get("artist") for r in rows if r.get("artist")}),
        "total_locations": len({r.get("location") for r in rows if r.get("location")}),
        "total_mediums": len({r.get("medium") for r in rows if r.get("medium")}),
        "by_artist": by_artist.most_common(20),
        "by_medium": by_medium.most_common(10),
        "by_location": by_location.most_common(10),
        "by_year": sorted(by_year.items()),
    }
