# EduOS / JeetMantra — VPS Deployment & Auto-Update

A single-VPS, Docker-based deploy where **GitHub keeps the running container up to
date automatically**. Push to `main` → GitHub Actions builds the image → GHCR →
Watchtower on the VPS pulls it and restarts the app. No manual deploy step.

```
  git push (main)
        │
        ▼
  GitHub Actions  ──build──►  ghcr.io/<owner>/<repo>:latest
        │                              │
        │                         (poll, 2 min)
        ▼                              ▼
   Trivy scan                    Watchtower (on VPS)
                                       │ pull + recreate
                                       ▼
                                  eduos_api container  ◄── Traefik (TLS) ◄── users
```

## What's in the repo
| File | Purpose |
|---|---|
| `backend/Dockerfile` | multi-stage, non-root, healthchecked production image (API + static `public/`) |
| `.dockerignore` | keeps secrets / node_modules / docs out of the image |
| `docker-compose.prod.yml` | Traefik (TLS) + api + redis + n8n + **watchtower** |
| `.env.example` | every env var, documented — copy to `.env.production` |
| `.github/workflows/deploy.yml` | build + push to GHCR on push to `main` |
| `backend/middleware/security.js` | helmet + compression + rate-limit + trust-proxy (already wired) |

> Supabase is **self-hosted separately** (its own host/compose). This stack talks
> to it over HTTPS via `SUPABASE_URL`; it is not in this compose file.

## One-time VPS setup (Ubuntu 22.04)
```bash
# 1. Docker + compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# 2. Firewall: SSH + web only
sudo ufw allow 22,80,443/tcp && sudo ufw enable

# 3. Clone + secrets
git clone https://github.com/jitendramindset/jeetmantraclaude.git eduos && cd eduos
cp .env.example .env.production && nano .env.production   # fill REAL values

# 4. GHCR auth (so Watchtower can pull). Use a PAT with read:packages.
echo $GHCR_PAT | docker login ghcr.io -u <github-user> --password-stdin

# 5. DNS: point APP_DOMAIN + N8N_DOMAIN A-records at the VPS IP first,
#    then bring the stack up (Traefik issues TLS on first request).
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## How updates flow (the "time by time" part)
1. You fix something and merge to `main`.
2. GitHub Actions builds `ghcr.io/<owner>/<repo>:latest` (and a `:<sha>` tag).
3. Watchtower (polling every 2 min) sees the new digest, pulls it, and recreates
   **only** the `api` container (it's the one labelled `watchtower.enable=true`).
4. Traefik keeps serving; the swap is a few seconds. Zero SSH, zero manual steps.

Force an immediate update instead of waiting for the poll:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production pull api && \
docker compose -f docker-compose.prod.yml --env-file .env.production up -d api
```

## Rollback
Images are tagged by commit SHA. To pin a previous build:
```bash
# in .env.production
API_IMAGE=ghcr.io/jitendramindset/jeetmantraclaude:<old-sha>
docker compose -f docker-compose.prod.yml --env-file .env.production up -d api
```
Migrations are idempotent + additive, so the older image stays schema-compatible.

## Alternative: SSH deploy instead of Watchtower
If you prefer the CI to push to the box (no polling), add an SSH step to the
workflow using `appleboy/ssh-action` that runs the `pull && up -d api` above, and
drop the `watchtower` service. Watchtower is the default because it needs no
inbound SSH and no secrets in the workflow.

## Before first production traffic (from the readiness audit)
- [ ] Rotate the secrets that were committed in the old root `docker-compose.yml`.
- [ ] Set `FRONTEND_URL` (locks CORS) and `NODE_ENV=production`.
- [ ] Nightly `pg_dump` of Supabase → encrypted → offsite, and **test a restore**.
- [ ] Add monitoring (Sentry + Uptime-Kuma on `/health`).
See `EDUOS_PRODUCTION_READINESS_AUDIT.md` for the full gate.
