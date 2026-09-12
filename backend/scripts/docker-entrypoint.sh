#!/usr/bin/env sh
set -e

log() {
  printf '%s [docker] %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*"
}

if [ "$SKIP_PRISMA_SETUP" = "true" ]; then
  log "skipping database setup (api server handles migrations and generate)"
else
  if [ -z "$DATABASE_URL" ]; then
    log "DATABASE_URL is required for prisma migrate deploy"
    exit 1
  fi

  log "applying database migrations…"
  pnpm exec prisma migrate deploy

  if [ "$NODE_ENV" = "development" ]; then
    log "generating prisma client…"
    # Bind-mounted output can be stale or partial; wipe before regenerate.
    rm -rf src/generated/prisma
    pnpm exec prisma generate
  fi
fi

log "starting: $*"
exec "$@"
