#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# JeetMantra EduOS — P0 Deployment Script
# Run on your production/staging server AFTER:
#   1. All secrets rotated
#   2. git history purge completed
#   3. This repo cloned/pulled on the server
#
# Usage:
#   cp backend/.env.example backend/.env
#   nano backend/.env            # fill in all real values
#   bash scripts/deploy-p0.sh
# ────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

log() { echo "[$(date '+%H:%M:%S')] $*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

# ── Pre-flight checks ───────────────────────────────────────────────────────
log "Pre-flight checks..."

[[ -f backend/.env ]] || die "backend/.env missing — copy backend/.env.example and fill in values"
source backend/.env

[[ -n "${SUPABASE_URL:-}" ]]             || die "SUPABASE_URL not set"
[[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]] || die "SUPABASE_SERVICE_ROLE_KEY not set"
[[ -n "${JWT_SECRET:-}" ]]               || die "JWT_SECRET not set"
[[ -n "${POSTGRES_PASSWORD:-}" ]]        || die "POSTGRES_PASSWORD not set"
[[ -n "${RAZORPAY_KEY_ID:-}" ]]          || die "RAZORPAY_KEY_ID not set"
[[ -n "${RAZORPAY_KEY_SECRET:-}" ]]      || die "RAZORPAY_KEY_SECRET not set"
[[ -n "${FRONTEND_URL:-}" ]]             || die "FRONTEND_URL not set"
[[ -n "${APP_BASE_URL:-}" ]]             || die "APP_BASE_URL not set"
[[ -n "${ADMIN_TOKEN:-}" ]]              || die "ADMIN_TOKEN not set"

# Warn if still using localhost Supabase
if echo "$SUPABASE_URL" | grep -q "localhost"; then
  echo "⚠️  WARNING: SUPABASE_URL contains 'localhost' — this is your dev instance."
  echo "   For production, point to your hosted Supabase project URL."
  read -p "   Continue anyway? [y/N] " ans
  [[ "$ans" =~ ^[Yy]$ ]] || die "Aborted."
fi

log "✓ Pre-flight passed"

# ── Node deps ───────────────────────────────────────────────────────────────
log "Installing Node dependencies..."
npm ci --prefix backend --omit=dev
log "✓ Dependencies installed"

# ── Run DB migrations ───────────────────────────────────────────────────────
log "Running database migrations (s0 → s18)..."

MIGRATIONS=(
  backend/database/migration-s0-foundation.sql
  backend/database/migration-s2-identity.sql
  backend/database/migration-s3-i18n.sql
  backend/database/migration-s3-ops.sql
  backend/database/migration-s4-booking.sql
  backend/database/migration-s5-student-success.sql
  backend/database/migration-s6-certs-impersonate.sql
  backend/database/migration-s7-role-org.sql
  backend/database/migration-s8-permission-tiers.sql
  backend/database/migration-s9-org-settings.sql
  backend/database/migration-s10-verticals.sql
  backend/database/migration-s11-polish.sql
  backend/database/migration-s12-widget-prefs.sql
  backend/database/migration-s13-permissions.sql
  backend/database/migration-s14-cms.sql
  backend/database/migration-s15-coupons.sql
  backend/database/migration-s16-exams-materials.sql
  backend/database/migration-s17-rls.sql
  backend/database/migration-s18-indexes.sql
)

# Extract host from SUPABASE_URL: https://abc.supabase.co → db.abc.supabase.co
SUPABASE_HOST=$(echo "$SUPABASE_URL" | sed 's|https://||' | sed 's|http://||')
DB_HOST="db.${SUPABASE_HOST}"

for f in "${MIGRATIONS[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "  ⚠️  Missing: $f — skipping"
    continue
  fi
  log "  Applying: $f"
  PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$DB_HOST" \
    -p 5432 \
    -U postgres \
    -d postgres \
    -f "$f" \
    -v ON_ERROR_STOP=1 \
    --quiet
  log "  ✓ $f"
done

log "✓ All migrations applied"

# ── Build minified app-shell ────────────────────────────────────────────────
if command -v npx &>/dev/null; then
  log "Building minified app-shell..."
  npx esbuild public/js/app-shell.js \
    --bundle=false \
    --minify \
    --outfile=public/js/app-shell.min.js \
    --log-level=warning
  log "✓ app-shell.min.js built ($(du -sh public/js/app-shell.min.js | cut -f1))"
else
  log "⚠️  esbuild not found — skipping minification (app-shell.js will be served unminified)"
fi

# ── PM2 ─────────────────────────────────────────────────────────────────────
log "Starting app with PM2..."

if ! command -v pm2 &>/dev/null; then
  log "Installing PM2 globally..."
  npm install -g pm2
fi

pm2 delete jeetmantra-app 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

log "✓ App running under PM2"
pm2 status

# ── Nginx ───────────────────────────────────────────────────────────────────
log "Checking Nginx..."

if command -v nginx &>/dev/null; then
  NGINX_AVAIL="/etc/nginx/sites-available/jeetmantra"
  NGINX_ENABLED="/etc/nginx/sites-enabled/jeetmantra"

  if [[ ! -f "$NGINX_AVAIL" ]]; then
    sudo cp nginx.conf "$NGINX_AVAIL"
    log "  Copied nginx.conf → $NGINX_AVAIL"
    sudo ln -sf "$NGINX_AVAIL" "$NGINX_ENABLED"
    log "  Enabled site"
  else
    log "  Nginx config already exists — skipping copy"
  fi

  sudo nginx -t && sudo systemctl reload nginx
  log "✓ Nginx reloaded"

  # Certbot TLS
  if command -v certbot &>/dev/null && [[ -n "${FRONTEND_URL:-}" ]]; then
    DOMAIN=$(echo "$FRONTEND_URL" | sed 's|https://||' | sed 's|http://||' | cut -d'/' -f1)
    if [[ -n "$DOMAIN" ]] && ! sudo certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
      log "Obtaining TLS certificate for $DOMAIN..."
      sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "mantravat@gmail.com" || \
        log "⚠️  Certbot failed — run manually: sudo certbot --nginx -d $DOMAIN"
    else
      log "  TLS cert already present for $DOMAIN"
    fi
  else
    log "⚠️  certbot not found or FRONTEND_URL not set — TLS not configured"
  fi
else
  log "⚠️  Nginx not installed — skipping (install: sudo apt-get install nginx certbot python3-certbot-nginx)"
fi

# ── Health check ────────────────────────────────────────────────────────────
log "Waiting for app to be ready..."
sleep 3
PORT_CHECK=${PORT:-5000}
if curl -sf "http://localhost:$PORT_CHECK/health" | grep -q '"status":"ok"'; then
  log "✓ Health check passed — app is up on port $PORT_CHECK"
else
  log "⚠️  Health check failed — check: pm2 logs jeetmantra-app"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  P0 Deployment complete"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Next steps:"
echo "  1. Run smoke tests:"
echo "     BASE_URL=https://yourdomain.com \\"
echo "     TEST_STUDENT_EMAIL=student@test.com \\"
echo "     TEST_STUDENT_PASS=yourpass \\"
echo "     node test/smoke.js"
echo ""
echo "  2. Configure UptimeRobot → https://yourdomain.com/health"
echo ""
echo "  3. Add SENTRY_DSN to backend/.env then: pm2 restart all"
echo ""
