#!/bin/bash
# ============================================================
# QQ 推送的薄封装：只负责加锁 + 调 Node 脚本 + 控制日志大小。
# 真正的逻辑在 /home/mud/mud/tools/qq_report.js（便于单独测试与复用）。
#
# 由 root crontab 每分钟调用（异常需要及时，所以比 pushlogs 的 5 分钟更密）。
# 任何失败都不非零退出，避免 cron 产生邮件噪音。
# ============================================================
set -uo pipefail

MUD_DIR=/home/mud/mud
LOG="$MUD_DIR/log/qqreport.log"
STATE_DIR=/var/lib/mud-qqbot

mkdir -p "$STATE_DIR" 2>/dev/null
touch "$LOG" 2>/dev/null

# 日志超过 5MB 只留末尾 2000 行
if [ -f "$LOG" ] && [ "$(stat -c %s "$LOG" 2>/dev/null || echo 0)" -gt 5242880 ]; then
    tail -n 2000 "$LOG" > "$LOG.tmp" 2>/dev/null && mv -f "$LOG.tmp" "$LOG" 2>/dev/null
fi

# 非阻塞锁：上一轮没跑完就跳过本轮（防止重叠）
exec 9>"$STATE_DIR/.lock" 2>/dev/null || exit 0
flock -n 9 || exit 0

{
    printf '[%s] --- 开始 ---\n' "$(date '+%F %T')"
    cd "$MUD_DIR" || exit 0
    timeout 90 node tools/qq_report.js 2>&1
    printf '[%s] --- 结束 (exit=%s) ---\n' "$(date '+%F %T')" "$?"
} >> "$LOG" 2>&1

exit 0
