"""Art Gallery backend configuration."""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()


def _req(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


class Settings:
    # Supabase (existing database — paintings, activity_logs)
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY", "")

    # Cloudinary (existing image storage)
    CLOUDINARY_CLOUD_NAME: str = os.environ.get("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.environ.get("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.environ.get("CLOUDINARY_API_SECRET", "")

    # Single-admin auth: bcrypt hash of the admin password.
    # Generate with: python -c "import bcrypt; print(bcrypt.hashpw(b'your-password', bcrypt.gensalt()).decode())"
    ADMIN_PASSWORD_HASH: str = os.environ.get("ADMIN_PASSWORD_HASH", "")

    JWT_SECRET: str = os.environ.get("JWT_SECRET", "")
    JWT_EXPIRE_HOURS: int = int(os.environ.get("JWT_EXPIRE_HOURS", "12"))

    # Public URL of the gallery (used for QR codes, e.g. http://167.172.80.99/gallery)
    PUBLIC_APP_URL: str = os.environ.get("PUBLIC_APP_URL", "").rstrip("/")

    ENVIRONMENT: str = os.environ.get("ENVIRONMENT", "development")


settings = Settings()
