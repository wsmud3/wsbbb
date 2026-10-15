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
# 属主自检：git 以当前用户运行，无法覆盖非本用户属主的文件，
# 那种情况下 merge 会失败并只留下一行含糊日志。这里提前给出明确原因。
if ! node tools/check_repo_ownership.js --quiet >>"$LOG" 2>&1; then
    log "Repo ownership/state precheck failed; see above lines. Run check_repo_ownership.js for detail"
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
# 依赖只有在 package-lock.json 变化时才需要重装，原因：
# `npm ci` 会先整个删除 node_modules 再重装，而它排在 pm2 reload 之前 —— 这段窗口内
# 任何进程重启（cron / 人工 / OOM）都会因模块缺失启动失败。实测已发生：
#   Cannot find module 'json5'   at os/util/util.js:4  → 进程以错误状态退出
# 只改代码的提交根本不需要重装，跳过即可消除该窗口。
# 依赖自检用 `npm ls --omit=dev`（而非只查某个包）：锁定未变但 node_modules 被
# 中断的安装破坏时，也能发现并重新安装。
# 注意：本脚本已在第 4 行 `cd /home/mud/mud`，因此这里一律用相对路径。
LOCK_STAMP=log/.npm-lock-sha
LOCK_SHA=$(sha256sum package-lock.json 2>/dev/null | cut -d' ' -f1 || true)
NEED_NPM=1
if [ -n "$LOCK_SHA" ] && [ -f "$LOCK_STAMP" ] && [ "$(cat "$LOCK_STAMP" 2>/dev/null || true)" = "$LOCK_SHA" ] && \
   npm ls --omit=dev --depth=0 >/dev/null 2>&1; then
    NEED_NPM=0
    log "package-lock.json 未变化且依赖自检通过，跳过 npm ci"
fi
if [ "$NEED_NPM" = "1" ]; then
    npm ci --omit=dev --no-audit --no-fund
    printf '%s\n' "$LOCK_SHA" > "$LOCK_STAMP"
fi
# Reload only this project's services. A nonzero reload is a failed deploy.
pm2 reload ecosystem.config.js --update-env
node tools/check_deploy_health.js "$REMOTE"
printf '%s\n' "$REMOTE" > log/deployed_ref.tmp
mv log/deployed_ref.tmp log/deployed_ref
log "Verified release $REMOTE on web and both game services"
