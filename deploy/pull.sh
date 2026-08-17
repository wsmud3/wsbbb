#!/bin/bash
# ============================================================
# 从 GitHub 拉取最新代码，有更新则优雅重启全部 PM2 进程
# 由 mud 用户的 crontab 每 5 分钟调用一次
# 日志：log/deploy.log
# ============================================================
cd /home/mud/mud || exit 1

git fetch -q origin main || exit 1

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
    git reset --hard -q origin/main
    pm2 reload all
    echo "[$(date '+%F %T')] 更新至 ${REMOTE:0:7}，已 pm2 reload" >> log/deploy.log
fi
