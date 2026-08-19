#!/bin/bash
# ============================================================
# 安全自动部署脚本（2026-08-18 重写，修复 force-push 事故）
# 由 mud 用户的 crontab 每 5 分钟调用一次
# 日志：log/deploy.log
#
# 防护原则：
#   1. 只接受快进更新（ff-only），拒绝 force-push 重写的历史
#   2. 更新前校验：工作区干净 + 远端提交包含关键文件
#   3. 更新前自动备份数据库和当前 commit，可回滚
#   4. 更新后做健康检查，失败自动回滚代码和数据
#   5. 任何异常都只记录日志并中止，绝不带病 reload
# ============================================================
set -u
cd /home/mud/mud || exit 1

LOG=log/deploy.log
KEY_FILES="config.js main.js web.js ecosystem.config.js"
BACKUP_DIR=data/backup/db

log() { echo "[$(date '+%F %T')] $1" >> "$LOG"; }

# ---------- 0. 工作区必须干净，否则不动 ----------
if ! git diff --quiet || ! git diff --cached --quiet; then
    log "跳过：工作区不干净（存在未提交改动），拒绝自动部署"
    exit 0
fi

# ---------- 1. 拉取远端 ----------
if ! git fetch -q origin main; then
    log "跳过：git fetch 失败"
    exit 0
fi

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

# ---------- 1.5 前端构建：代码比上次构建新就重建（即使没有新提交） ----------
# www/ 是 gitignore 的本地构建产物，不入版本库；这里保证拉取后的
# 前端代码能自动构建生效（同时修复 pull.sh 自身更新后不触发构建的问题）
BUILT_REF_FILE=log/last_built_ref
BUILT_REF=$(cat "$BUILT_REF_FILE" 2>/dev/null || true)
if [ "$BUILT_REF" != "$LOCAL" ]; then
    # 自愈清理：root 属主的构建产物 mud 无法覆盖，会阻塞构建
    # （www 目录本身属主为 mud，cron 可以删除其中的 root 文件）
    find www -user root -delete 2>/dev/null || true
    if npm run build >> "$LOG" 2>&1; then
        echo "$LOCAL" > "$BUILT_REF_FILE"
        log "前端构建完成 ${LOCAL:0:7}（www/ 已更新）"
    else
        log "错误：前端构建失败 ${LOCAL:0:7}，前端保持旧版本，下轮自动重试"
    fi
fi

# 无更新，什么都不做（避免无意义 reload）
[ "$LOCAL" = "$REMOTE" ] && exit 0

# ---------- 2. 关键文件校验：目标提交必须包含关键文件 ----------
for f in $KEY_FILES; do
    if ! git ls-tree "$REMOTE" -- "$f" | grep -q .; then
        log "中止：远端 ${REMOTE:0:7} 缺少关键文件 $f（疑似坏提交），拒绝自动部署，需人工检查"
        exit 0
    fi
done

# ---------- 3. 只接受快进更新，拒绝重写历史 ----------
if ! git merge-base --is-ancestor "$LOCAL" "$REMOTE"; then
    log "中止：远端 ${REMOTE:0:7} 与本地 ${LOCAL:0:7} 历史分叉（疑似 force-push），拒绝自动部署，需人工检查"
    exit 0
fi

# ---------- 4. 更新前备份 ----------
PREV_REF=$LOCAL
mkdir -p "$BACKUP_DIR"
sqlite3 data/database.db ".backup '$BACKUP_DIR/db_predeploy_$(date +%F_%H-%M-%S).db'" 2>/dev/null \
    || cp data/database.db "$BACKUP_DIR/db_predeploy_$(date +%F_%H-%M-%S).db"
# 预部署备份只保留最近 20 份
ls -t "$BACKUP_DIR"/db_predeploy_*.db 2>/dev/null | tail -n +21 | xargs -r rm -f

# ---------- 5. 快进合并 ----------
if ! git merge --ff-only -q origin/main; then
    log "错误：merge --ff-only 失败，保持当前版本不变"
    exit 0
fi

# ---------- 6. 重启并健康检查 ----------
pm2 reload all
sleep 12

HEALTHY=1
# 健康检查 1：web API 正常响应
curl -sf -m 5 http://127.0.0.1:8088/api/game/servers >/dev/null || HEALTHY=0
# 健康检查 2：两个游戏服端口在监听
ss -tln 2>/dev/null | grep -q ':31301 ' || HEALTHY=0
ss -tln 2>/dev/null | grep -q ':31300 ' || HEALTHY=0

if [ "$HEALTHY" != "1" ]; then
    log "错误：更新至 ${REMOTE:0:7} 后健康检查失败，自动回滚"
    git reset --hard -q "$PREV_REF" || log "错误：代码回滚失败，请人工处理"
    LATEST_DB=$(ls -t "$BACKUP_DIR"/db_predeploy_*.db 2>/dev/null | head -1)
    if [ -n "$LATEST_DB" ]; then
        cp "$LATEST_DB" data/database.db && log "已恢复数据库备份 $LATEST_DB"
    fi
    pm2 reload all
    log "已自动回滚至 ${PREV_REF:0:7}，请检查健康状态"
    exit 0
fi

log "更新至 ${REMOTE:0:7}（快进合并），健康检查通过，已 pm2 reload"
