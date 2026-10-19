"""Single-admin JWT auth (httpOnly cookie, like the KPI system)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, Request, status

import bcrypt as bcrypt_lib

from app.core.config import settings

ALGORITHM = "HS256"
COOKIE_NAME = "art_gallery_session"


def verify_admin_password(plain: str) -> bool:
    if not settings.ADMIN_PASSWORD_HASH:
        return False
    try:
        return bcrypt_lib.checkpw(
            plain.encode("utf-8"), settings.ADMIN_PASSWORD_HASH.encode("utf-8")
        )
    except Exception:
        return False


def hash_password(plain: str) -> str:
    return bcrypt_lib.hashpw(plain.encode("utf-8"), bcrypt_lib.gensalt()).decode("utf-8")


def create_token() -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "admin",
        "iat": now,
        "exp": now + timedelta(hours=settings.JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def _token_from_request(request: Request) -> str | None:
    cookie = request.cookies.get(COOKIE_NAME)
    if cookie:
        return cookie
    return None


def get_current_admin(request: Request) -> str:
    token = _token_from_request(request)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated.")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session.")
    if payload.get("sub") != "admin":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid session.")
    return "admin"


def require_admin(_: str = Depends(get_current_admin)) -> str:
    return _
