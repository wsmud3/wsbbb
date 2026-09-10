#!/bin/bash
# Run as mud from cron. Failure never restores or overwrites player databases.
set -euo pipefail
cd /home/mud/mud
mkdir -p log data/backup/db
LOG=log/deploy.log
log() { echo "[$(date '+%F %T')] $*" >> "$LOG"; }
trap 'log "Deployment failed at line $LINENO; keep player database and inspect services"' ERR
exec 9>log/deploy.lock.flock
flock -n 9 || exit 0
if ! git diff --quiet || ! git diff --cached --quiet; then
    log "Dirty checkout; deployment refused"
    exit 1
fi
git fetch -q origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
git merge-base --is-ancestor "$LOCAL" "$REMOTE"
# Validate candidate tree before touching the checkout.
for file in config.js main.js web.js ecosystem.config.js; do
    git cat-file -e "$REMOTE:$file"
done
node tools/check_release_assets.js "$REMOTE"
DEPLOYED=$(cat log/deployed_ref 2>/dev/null || true)
if [ "$LOCAL" = "$REMOTE" ] && [ "$DEPLOYED" = "$REMOTE" ]; then
    exit 0
fi
# SQLite backup API provides a consistent snapshot, including committed WAL.
# Fail closed: a raw copy of the live .db is NOT an acceptable fallback.
node tools/backup_database.js data/database.db "data/backup/db/db_predeploy_$(date +%F_%H-%M-%S)_$$.db"
git merge --ff-only -q "$REMOTE"
npm ci --omit=dev --no-audit --no-fund
# Reload only this project's services. A nonzero reload is a failed deploy.
pm2 reload ecosystem.config.js --update-env
node tools/check_deploy_health.js "$REMOTE"
printf '%s\n' "$REMOTE" > log/deployed_ref.tmp
mv log/deployed_ref.tmp log/deployed_ref
log "Verified release $REMOTE on web and both game services"
