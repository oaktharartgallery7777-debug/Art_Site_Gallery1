"""Cloudinary image upload / delete (existing image storage)."""

from __future__ import annotations

import cloudinary
import cloudinary.uploader

from app.core.config import settings

_configured = False


def _ensure_configured() -> None:
    global _configured
    if _configured:
        return
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )
    _configured = True


def upload_image(file_bytes: bytes, file_name: str) -> str | None:
    """Upload image bytes; returns the secure URL, or None on failure."""
    _ensure_configured()
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            public_id=f"art_gallery/{file_name.rsplit('.', 1)[0]}",
            resource_type="image",
        )
        return result.get("secure_url")
    except Exception:
        return None


def delete_image(image_url: str) -> None:
    """Best-effort delete by URL (extracts the public id). Failures are ignored."""
    _ensure_configured()
    try:
        # URL looks like .../upload/v123/art_gallery/<name>.<ext>
        marker = "/upload/"
        idx = image_url.find(marker)
        if idx == -1:
            return
        tail = image_url[idx + len(marker):]
        # strip version prefix v123/
        parts = tail.split("/", 1)
        public_id = parts[1] if len(parts) == 2 and parts[0].startswith("v") else tail
        public_id = public_id.rsplit(".", 1)[0]
        cloudinary.uploader.destroy(public_id, resource_type="image")
    except Exception:
        pass
