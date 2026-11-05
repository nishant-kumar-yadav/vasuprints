#!/usr/bin/env bash
# Usage: deploy.sh <commit-sha|branch>      RUN_SEED=1 deploy.sh <sha>  also runs `pnpm db:seed` before the build
set -euo pipefail
REF="${1:-main}"
ROOT=/srv/vasuprint
APP_PORT=3000                       # the free port chosen in §2.0; must match the Nginx upstream (§5.2)
export PATH=/opt/node22/bin:$PATH   # VasuPrint's own Node, not the system one
export MONGOMS_DISABLE_POSTINSTALL=1 CI=true

# Don't starve the existing site: need ~1.5 GB of available RAM + swap to build
AVAIL_MB=$(awk '/MemAvailable/{m=$2} /SwapFree/{s=$2} END{print int((m+s)/1024)}' /proc/meminfo)
if [ "$AVAIL_MB" -lt 1536 ]; then echo "Only ${AVAIL_MB} MB available; refusing to build (see §2.2 swap)"; exit 1; fi

git --git-dir="$ROOT/repo" fetch --prune --quiet
SHA="$(git --git-dir="$ROOT/repo" rev-parse --verify "$REF^{commit}")"
REL="$ROOT/releases/$(date +%Y%m%d-%H%M%S)-${SHA:0:7}"
PREV="$(readlink -f "$ROOT/current" 2>/dev/null || true)"

mkdir -p "$REL"
trap 'echo "Build failed, removing $REL"; rm -rf "$REL"' ERR
git --git-dir="$ROOT/repo" archive "$SHA" | tar -x -C "$REL"
ln -s "$ROOT/shared/.env" "$REL/.env"           # read by next build, next start and the pnpm scripts
cd "$REL"
pnpm install --frozen-lockfile
if [ "${RUN_SEED:-0}" = "1" ]; then pnpm db:seed; fi
nice -n 10 pnpm build                 # lower priority than the existing site

cat > "$REL/ecosystem.config.cjs" <<PM2
module.exports = { apps: [{
  name: 'vasuprint',
  cwd: '$REL',
  script: 'node_modules/next/dist/bin/next',
  args: 'start -p $APP_PORT -H 127.0.0.1',
  exec_mode: 'fork',
  instances: 1,
  env: { NODE_ENV: 'production', APP_VERSION: '${SHA:0:7}' },
  max_memory_restart: '700M',
  kill_timeout: 10000,
  out_file: '$ROOT/shared/logs/out.log',
  error_file: '$ROOT/shared/logs/error.log',
  time: true,
}] };
PM2
trap - ERR

start() { pm2 delete vasuprint >/dev/null 2>&1 || true; pm2 start "$1/ecosystem.config.cjs"; pm2 save --force >/dev/null; }

ln -sfn "$REL" "$ROOT/current"
start "$REL"

for i in $(seq 1 30); do
  if curl -fsS -m 5 "http://127.0.0.1:$APP_PORT/api/health" >/dev/null; then
    echo "Deployed ${SHA:0:7} ($REL)"
    ls -1dt "$ROOT"/releases/*/ | tail -n +6 | xargs -r rm -rf     # keep the 5 newest
    exit 0
  fi
  sleep 2
done

echo "Health check failed for ${SHA:0:7}"
pm2 logs vasuprint --lines 40 --nostream || true
if [ -n "$PREV" ] && [ -d "$PREV" ]; then
  echo "Rolling back to $PREV"
  ln -sfn "$PREV" "$ROOT/current"
  start "$PREV"
fi
exit 1
