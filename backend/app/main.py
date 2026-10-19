"""Art Gallery API — FastAPI backend for the React frontend."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routers import activity, analytics, auth, paintings, tools

app = FastAPI(title="Art Gallery API", docs_url=None, redoc_url=None, openapi_url=None)

app.include_router(auth.router)
app.include_router(paintings.router)
app.include_router(analytics.router)
app.include_router(activity.router)
app.include_router(tools.router)


@app.get("/healthz")
def healthz():
    return {"ok": True}


# Serve the React SPA build (copied to /app/static by the Dockerfile).
STATIC_DIR = Path("/app/static")
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        candidate = STATIC_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(STATIC_DIR / "index.html")
