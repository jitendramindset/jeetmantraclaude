# syntax=docker/dockerfile:1
# EduOS / JeetMantra production image.
# Build context = repo ROOT (the app serves ../public, so both are needed):
#   docker build -f backend/Dockerfile -t eduos-api .

# ---- deps: install production node_modules with a reproducible lockfile ----
FROM node:20-alpine AS deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# ---- runtime: slim, non-root ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
# wget is in alpine busybox (used by the healthcheck); tini for clean signals.
RUN apk add --no-cache tini && addgroup -S app && adduser -S app -G app

COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend ./backend
COPY public ./public

# Writable uploads + leveldb cache dirs, owned by the non-root user.
RUN mkdir -p backend/uploads backend/.leveldb && chown -R app:app /app
USER app
WORKDIR /app/backend

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-5000}/health" >/dev/null 2>&1 || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
