# ABC Art Gallery — React + FastAPI

Rebuild of the Streamlit `ABC_MIB_ART_GALLERY` app. Same Supabase database
and Cloudinary images — no data migration needed.

## Stack

- **Frontend:** React 18 + Vite, dark gallery theme
- **Backend:** FastAPI, `supabase-py` (existing tables: `paintings`, `activity_logs`),
  Cloudinary for images, JWT-in-cookie admin auth (single admin)
- **Deploy:** one Docker container (backend serves API + static SPA), behind Caddy

## Pages

| Route | Access | Description |
|---|---|---|
| `/` | public | Gallery Explorer — search, filters, pagination |
| `/art/:id` or `/?id=` | public | Artwork detail (QR codes point here) |
| `/admin/login` | — | Admin login |
| `/admin` | admin | Dashboard — analytics & stats |
| `/admin/inventory` | admin | Add / browse / delete artworks |
| `/admin/edit` | admin | Edit artwork by ID ("Manage Database") |
| `/admin/import` | admin | Bulk CSV import |
| `/admin/qr` | admin | QR code generator |
| `/admin/labels` | admin | Printable label cards (PDF) |
| `/admin/batch-location` | admin | Move many artworks at once |
| `/admin/replace-image` | admin | Swap an artwork's photo |
| `/admin/activity` | admin | Activity log |

## Local dev

```bash
# backend
cd backend && python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill in secrets
PYTHONPATH=. uvicorn app.main:app --reload

# frontend
cd frontend && npm install && npm run dev   # proxies /api to :8000
```

## Server deploy (167.172.80.99, alongside the KPI app)

The KPI app's Caddy is the front door. Two hosting options:

**Option A — subpath (recommended, no extra port):** `http://167.172.80.99/gallery`

1. On the server:
```bash
git clone <this-repo> ~/art-gallery-app && cd ~/art-gallery-app
cp .env.example .env   # fill in SUPABASE_*, CLOUDINARY_*, ADMIN_PASSWORD_HASH, JWT_SECRET
# PUBLIC_APP_URL=http://167.172.80.99/gallery
docker compose up -d --build
```
2. In `~/kpi-app/docker-compose.yml`, add the gallery service to the same
   compose network **or** connect containers: the simplest is to run the
   gallery compose with `network_mode` sharing, but cleanest is one Caddy
   reverse-proxy entry. Add to the kpi-app `Caddyfile`, inside the
   `{$DOMAIN}` block (or the `:80` fallback block for bare-IP):
```caddy
   handle /gallery/* {
       uri strip_prefix /gallery
       reverse_proxy art-gallery:8000
   }
```
   and add `art-gallery` to the same Docker network as Caddy
   (`docker network connect kpi-app_default art-gallery`).
3. Frontend subpath: rebuild with `base: "/gallery/"` in `vite.config.js`
   (or keep `/` and use Option B).

**Option B — separate port:** `http://167.172.80.99:8501`

1. Publish the port: add `ports: ["8501:8000"]` to `docker-compose.yml`.
2. Open the firewall: `ufw allow 8501/tcp`.
3. Set `PUBLIC_APP_URL=http://167.172.80.99:8501`.

## Secrets

Generate the admin password hash once:
```bash
python -c "from passlib.hash import bcrypt; print(bcrypt.hash('choose-a-strong-password'))"
```
Put the output in `ADMIN_PASSWORD_HASH`. Never commit `.env`.
