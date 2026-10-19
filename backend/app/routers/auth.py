"""Admin auth: login / logout / session check."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import COOKIE_NAME, create_token, require_admin, verify_admin_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    password: str


def _cookie_kwargs(request: Request) -> dict:
    # Set Secure only when the login request actually arrived over HTTPS
    # (X-Forwarded-Proto aware for reverse-proxy setups). A Secure cookie
    # over plain HTTP is dropped by browsers, which breaks login.
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    proto = proto.split(",")[0].strip().lower()
    return {
        "httponly": True,
        "samesite": "lax",
        "secure": proto == "https",
        "path": "/",
    }


@router.post("/login")
def login(payload: LoginRequest, request: Request, response: Response):
    if not verify_admin_password(payload.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect password.")
    token = create_token()
    response.set_cookie(COOKIE_NAME, token, max_age=settings.JWT_EXPIRE_HOURS * 3600,
                        **_cookie_kwargs(request))
    return {"ok": True}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me")
def me(_: str = Depends(require_admin)):
    return {"authenticated": True, "role": "admin"}
