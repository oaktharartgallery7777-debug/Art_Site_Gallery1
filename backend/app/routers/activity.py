"""Activity log (admin only)."""

from fastapi import APIRouter, Depends, Query

from app.core.security import require_admin
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/api/activity", tags=["activity"],
                   dependencies=[Depends(require_admin)])


@router.get("")
def list_activity(page: int = Query(1, ge=1), per_page: int = Query(30, ge=1, le=100)):
    sb = get_supabase()
    start = (page - 1) * per_page
    res = (sb.table("activity_logs").select("*", count="exact")
           .order("created_at", desc=True)
           .range(start, start + per_page - 1).execute())
    total = res.count or 0
    return {
        "items": res.data,
        "total": total,
        "page": page,
        "total_pages": max(1, -(-total // per_page)),
    }
