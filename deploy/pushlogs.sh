#!/bin/bash
# ============================================================
# 系统日志定时上报（2026-08-21 新增）
# 由 mud 用户的 crontab 每 5 分钟调用一次（:02/:07/...，错开 pull.sh）
# 本地日志：log/pushlogs.log
#
# 功能：
#   1. 采集两服 IPC 状态、web 健康、pm2、内存/磁盘/端口监听
#   2. 生成 status.md（心跳时间 + 数字指标 + 今日错误摘要 + 最近部署）
#   3. 复制"已冻结"（昨天及更早）的每日日志进仓库，超大文件截断/跳过
#   4. 提交并推送到独立日志仓库（单向上传，与部署仓库完全隔离）
#
# 可靠性原则：
#   1. 任何步骤失败只记日志，绝不非零退出（避免 cron 噪音）
#   2. push 失败时提交留本地，下轮自动补推（积压长度即故障时长）
#   3. 提交历史即心跳：正常情况下每 5 分钟一条，停更即服务器异常
# ============================================================
set -u

MUD_DIR=/home/mud/mud
LOGS_DIR=/home/mud/mud-logs
REMOTE=git@github.com:wsmud3/wsbbb-logs.git
LOG=$MUD_DIR/log/pushlogs.log
LOCK=$MUD_DIR/log/.pushlogs.lock
# .env 是 CRLF 行尾：必须去 \r，否则密钥带尾随 \r 会被 Node 判为非法请求头（400）
SECRET=$(grep '^ADMIN_IPC_SECRET=' "$MUD_DIR/.env" | head -1 | cut -d= -f2- | tr -d '\r')

# pushlogs.log 超过 20MB 时只保留末尾 2000 行
if [ -f "$LOG" ] && [ "$(stat -c %s "$LOG" 2>/dev/null || echo 0)" -gt 20971520 ]; then
    tail -n 2000 "$LOG" > "$LOG.tmp" && mv -f "$LOG.tmp" "$LOG"
fi

log() { echo "[$(date '+%F %T')] $1" >> "$LOG"; }

# ---------- 并发锁（非阻塞，拿不到就跳过本轮） ----------
exec 9>"$LOCK" || { log "错误：无法创建锁文件 $LOCK"; exit 0; }
flock -n 9 || exit 0

# ---------- 0. 首次初始化日志仓库 ----------
if [ ! -d "$LOGS_DIR/.git" ]; then
    mkdir -p "$LOGS_DIR"
    if ! git init -q -b main "$LOGS_DIR"; then
        log "错误：git init 失败（$LOGS_DIR）"
        exit 0
    fi
    git -C "$LOGS_DIR" config user.name "mud-server"
    git -C "$LOGS_DIR" config user.email "server@msmud.local"
    log "已初始化日志仓库 $LOGS_DIR"
fi
# origin 指向日志仓库（首次或误删后重建）
git -C "$LOGS_DIR" remote get-url origin >/dev/null 2>&1 || git -C "$LOGS_DIR" remote add origin "$REMOTE"
[ -f "$LOGS_DIR/README.md" ] || cat > "$LOGS_DIR/README.md" <<'EOF'
# wsbbb 服务器系统日志

由服务器（mud 用户 crontab）每 5 分钟自动推送的 MUD 运行状态与日志，单向上传：服务器只推不拉，与部署仓库 wsmud3/wsbbb 完全隔离。

- **status.md** — 最新心跳快照（UTC + 北京时间），含在线人数、运行时长、内存/磁盘、今日错误摘要、最近部署记录
- **logs/** — 昨天及更早的每日游戏日志（debug/info/warn/error/fatal）；超大文件会截断或跳过，清单见 logs/README.md
- **提交历史即心跳** — 正常每 5 分钟一条提交；停止更新说明服务器异常
EOF
[ -f "$LOGS_DIR/.gitignore" ] || printf '.env*\n*.tmp\n' > "$LOGS_DIR/.gitignore"

TODAY=$(TZ=UTC date +%F)

# ---------- 1. 采集数据源（每项独立容错，互不联动） ----------

# 游戏服 IPC 状态（失败按 curl 退出码记录，7=拒连 28=超时）
get_ipc() { curl -m 3 -sf -H "X-IPC-Secret: $SECRET" "http://127.0.0.1:$1/api/status" 2>/dev/null; }

IPC100=$(get_ipc 31303); RC100=$?
IPC200=$(get_ipc 31304); RC200=$?

parse_ipc() {
    printf '%s' "$1" | node -e '
        var d = "";
        process.stdin.on("data", function (c) { d += c; });
        process.stdin.on("end", function () {
            try {
                var j = JSON.parse(d);
                console.log([j.playerCount || 0, j.uptime || 0, j.connectCount || 0, j.status || "?"].join("|"));
            } catch (e) { console.log("?|0|?|?"); }
        });
    ' 2>/dev/null
}

fmt_uptime() { # $1=秒 → "3d 5h 12m"
    local s=${1:-0}
    echo "$((s/86400))d $(((s%86400)/3600))h $(((s%3600)/60))m"
}

F100=$(parse_ipc "$IPC100")
F200=$(parse_ipc "$IPC200")
P100=$(printf '%s' "$F100" | cut -d'|' -f1); [ "$RC100" -ne 0 ] && P100="-"
P200=$(printf '%s' "$F200" | cut -d'|' -f1); [ "$RC200" -ne 0 ] && P200="-"

game_row() { # $1=服名 $2=字段行 $3=rc
    if [ "$3" -ne 0 ]; then
        echo "| $1 | 查询失败(rc=$3) | - | - | - |"
        return
    fi
    local pl up cc st
    IFS='|' read -r pl up cc st <<< "$2"
    echo "| $1 | ${st} | ${pl} | ${cc} | $(fmt_uptime "$up") |"
}

GAME100=$(game_row "本地测试(100)" "$F100" "$RC100")
GAME200=$(game_row "正式服(200)" "$F200" "$RC200")

# web 健康
WEB_JSON=$(curl -m 3 -sf http://127.0.0.1:8088/health 2>/dev/null); WEB_RC=$?
WEB_FIELDS=$(printf '%s' "$WEB_JSON" | node -e '
    var d = "";
    process.stdin.on("data", function (c) { d += c; });
    process.stdin.on("end", function () {
        try {
            var j = JSON.parse(d);
            console.log([j.status || "?", j.uptimeStr || "?", (j.memory && j.memory.rssMB) || 0].join("|"));
        } catch (e) { console.log("?|?|0"); }
    });
' 2>/dev/null)
if [ "$WEB_RC" -ne 0 ]; then
    WEB_LINE="- 查询失败(rc=$WEB_RC)"
else
    IFS='|' read -r WS WU WM <<< "$WEB_FIELDS"
    WEB_LINE="- status: ${WS} | 运行 ${WU} | rss ${WM}MB"
fi

# pm2 进程
PM2_ROWS=$(pm2 jlist 2>/dev/null | node -e '
    var d = "";
    process.stdin.on("data", function (c) { d += c; });
    process.stdin.on("end", function () {
        try {
            var a = JSON.parse(d);
            var rows = [];
            a.forEach(function (p) {
                var e = p.pm2_env || {};
                var up = Math.max(0, Math.floor((Date.now() - (e.pm_uptime || 0)) / 1000));
                var mb = Math.round((p.monit && p.monit.memory || 0) / 1048576);
                rows.push([p.name, e.status || "?", e.restart_time || 0, mb, up].join("|"));
            });
            console.log(rows.join("\n"));
        } catch (e) { console.log(""); }
    });
' 2>/dev/null)
PM2_LINES=""
while IFS= read -r row; do
    [ -z "$row" ] && continue
    IFS='|' read -r nm st rt mb up <<< "$row"
    PM2_LINES="${PM2_LINES}| ${nm} | ${st} | ${rt} | ${mb}MB | $(fmt_uptime "$up") |
"
done <<< "$PM2_ROWS"

# 系统资源
MEM_LINE=$(free -m | awk '/^Mem:/ {print $3 "MB / " $2 "MB"}')
[ -z "$MEM_LINE" ] && MEM_LINE="查询失败"
DISK_LINE=$(df -h / | awk 'NR==2 {print $5 " 已用（" $4 " 可用）"}')
[ -z "$DISK_LINE" ] && DISK_LINE="查询失败"
PORT_LINE=""
for p in 31300 31301 8088; do
    if ss -tln 2>/dev/null | grep -q ":$p "; then PORT_LINE="$PORT_LINE ${p}✔"; else PORT_LINE="$PORT_LINE ${p}✘"; fi
done

# 今日日志计数与摘要（UTC 日期与游戏一致）
CNT() { # $1=类型 → 行数
    local f="$MUD_DIR/log/$1_${TODAY}.log"
    if [ -f "$f" ]; then wc -l < "$f"; else echo 0; fi
}
WARN_CNT=$(CNT warn); ERR_CNT=$(CNT error); FATAL_CNT=$(CNT fatal)
ERR_TAIL=$(tail -n 10 "$MUD_DIR/log/error_${TODAY}.log" 2>/dev/null || true)
FATAL_TAIL=$(tail -n 10 "$MUD_DIR/log/fatal_${TODAY}.log" 2>/dev/null || true)
DEPLOY_TAIL=$(tail -n 20 "$MUD_DIR/log/deploy.log" 2>/dev/null || true)

# ---------- 2. 生成 status.md ----------
{
    echo "# 服务器运行状态"
    echo
    echo "**心跳**: $(TZ=UTC date '+%F %T') UTC / 北京时间 $(TZ=Asia/Shanghai date '+%F %T')"
    echo
    echo "## 游戏服"
    echo
    echo "| 服务器 | 状态 | 在线 | 连接 | 运行时长 |"
    echo "| --- | --- | --- | --- | --- |"
    echo "$GAME100"
    echo "$GAME200"
    echo
    echo "## Web 服务"
    echo
    echo "$WEB_LINE"
    echo
    echo "## pm2 进程"
    echo
    echo "| 进程 | 状态 | restarts | 内存 | 运行时长 |"
    echo "| --- | --- | --- | --- | --- |"
    if [ -n "$PM2_LINES" ]; then printf '%s' "$PM2_LINES"; else echo "| （pm2 查询失败） |"; fi
    echo
    echo "## 系统"
    echo
    echo "- 内存: ${MEM_LINE}"
    echo "- 磁盘: ${DISK_LINE}"
    echo "- 端口监听:${PORT_LINE}"
    echo
    echo "## 今日日志（UTC ${TODAY}）"
    echo
    echo "- warn: ${WARN_CNT} | error: ${ERR_CNT} | fatal: ${FATAL_CNT}"
    if [ -n "$ERR_TAIL" ]; then
        echo
        echo "### 今日 error（最近 10 条）"
        echo
        echo '```'
        echo "$ERR_TAIL"
        echo '```'
    fi
    if [ -n "$FATAL_TAIL" ]; then
        echo
        echo "### 今日 fatal（最近 10 条）"
        echo
        echo '```'
        echo "$FATAL_TAIL"
        echo '```'
    fi
    echo
    echo "## 最近部署（deploy.log 末尾 20 行）"
    echo
    echo '```'
    echo "$DEPLOY_TAIL"
    echo '```'
} > "$LOGS_DIR/status.md"

# ---------- 3. 复制已冻结的每日日志（昨天及更早，UTC 日期） ----------
NOTES=""
mkdir -p "$LOGS_DIR/logs"
for type in debug info warn error fatal; do
    for f in "$MUD_DIR"/log/${type}_????-??-??.log; do
        [ -f "$f" ] || continue
        date=$(basename "$f" | sed -n 's/^[a-z]*_\([0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}\)\.log$/\1/p')
        [ -n "$date" ] || continue
        [[ "$date" < "$TODAY" ]] || continue   # 当天文件不复制（内容已摘要在 status.md）
        dest="$LOGS_DIR/logs/$(basename "$f")"
        [ -f "$dest" ] && continue             # 已复制过（幂等）
        size=$(stat -c %s "$f" 2>/dev/null || echo 0)
        if [ "$size" -le 204800 ]; then
            cp -p "$f" "$dest"
        elif [ "$size" -le 1048576 ]; then
            { echo "【原文件过大已截断：$((size/1024))KB，仅保留最后 500 行】"; tail -n 500 "$f"; } > "$dest"
            NOTES="${NOTES}- $(basename "$f")：截断（$((size/1024))KB > 200KB，保留最后 500 行）
"
        else
            NOTES="${NOTES}- $(basename "$f")：跳过（$((size/1024/1024))MB > 1MB）
"
        fi
    done
done
if [ -n "$NOTES" ]; then
    {
        echo "# 日志处理说明"
        echo
        echo "以下文件因过大被截断或跳过："
        echo
        printf '%s' "$NOTES"
    } > "$LOGS_DIR/logs/README.md"
fi

# ---------- 4. 提交并推送（失败留本地，下轮自动补推） ----------
(
    cd "$LOGS_DIR" || { log "错误：无法进入 $LOGS_DIR"; exit 0; }
    git add -A 2>/dev/null || true
    if ! git diff --cached --quiet; then
        MSG="hb $(TZ=UTC date '+%Y-%m-%dT%H:%MZ') p100=${P100} p200=${P200} e=${ERR_CNT} f=${FATAL_CNT}"
        if git commit -q -m "$MSG" 2>>"$LOG"; then
            log "已提交心跳（测试服 ${P100} / 正式服 ${P200} 在线，e=${ERR_CNT} f=${FATAL_CNT}）"
        else
            log "错误：git commit 失败"
        fi
    fi
    if GIT_SSH_COMMAND='ssh -o ConnectTimeout=10 -o ServerAliveInterval=15' git push -q origin main 2>>"$LOG"; then
        log "已推送到日志仓库"
    else
        log "推送失败（仓库未创建或网络异常），提交留本地，下轮自动补推"
    fi
)
exit 0
