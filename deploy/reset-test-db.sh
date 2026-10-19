#!/bin/bash
# 测试服数据库隔离 + 从正式服播种
#
# 用法：
#   sudo /home/mud/bin/reset-test-db.sh              # 只更新 database.db（保留测试服角色数据）
#   sudo /home/mud/bin/reset-test-db.sh --with-data  # 连 data/100 一起重置（清空测试服角色）
#
# 为什么需要：
#   原先 /home/mud/mud-test/data 是指向 /home/mud/mud/data 的软链接，
#   于是测试服和正式服打开的是**同一个 database.db**（lsof 实测同一 inode）。
#   朋友在测试服的任何操作都会写进正式服玩家数据。
#
# 安全措施：
#   · 用 sqlite3 的 .backup 取一致快照（游戏在跑也能安全复制）
#   · 覆盖前先把现有测试库备份到 data/backup/test-db-<时间>.db
#   · 只在 --with-data 时才动 data/100（那里面是测试服角色数据）
#   · 全程校验测试库不是软链接（防止又变回共享）
set -uo pipefail

PROD_DATA=/home/mud/mud/data
TEST_DATA=/home/mud/mud-test/data
BACKUP_DIR=$TEST_DATA/backup
LOG=/var/log/mud-test-db.log

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$LOG"; }

WITH_DATA=0
[ "${1:-}" = "--with-data" ] && WITH_DATA=1

if [ "$(id -u)" -ne 0 ]; then
    echo "请用 root 执行（或 sudo）" >&2
    exit 1
fi

# ── 0. 前置检查 ───────────────────────────────────────────────
if [ -L "$TEST_DATA" ]; then
    log "测试服 data 仍是软链接（指向 $(readlink "$TEST_DATA")），需要先改成真实目录"
    log "请先执行 /home/mud/bin/isolate-test-db.sh 完成一次性改造"
    exit 1
fi
[ -d "$TEST_DATA" ] || { log "错误：$TEST_DATA 不存在"; exit 1; }
[ -f "$PROD_DATA/database.db" ] || { log "错误：找不到正式服数据库"; exit 1; }

# 确认两者不是同一个文件
P=$(stat -c %i "$PROD_DATA/database.db" 2>/dev/null || echo x)
T=$(stat -c %i "$TEST_DATA/database.db" 2>/dev/null || echo x)
if [ "$P" = "$T" ] && [ "$P" != "x" ]; then
    log "错误：正式服与测试服 database.db 仍是同一文件（inode $P），拒绝继续"
    exit 1
fi

install -d -m 775 -o mud -g mudmod "$BACKUP_DIR"

# ── 1. 备份现有测试库 ─────────────────────────────────────────
if [ -f "$TEST_DATA/database.db" ]; then
    STAMP=$(date '+%Y%m%d-%H%M%S')
    sqlite3 "$TEST_DATA/database.db" ".backup '$BACKUP_DIR/test-db-$STAMP.db'" 2>>"$LOG" \
        && log "已备份旧测试库 → data/backup/test-db-$STAMP.db" \
        || log "备份旧测试库失败（继续）"
fi

# ── 2. 从正式服取一致快照 ─────────────────────────────────────
TMP=$(mktemp /tmp/prod-snapshot-XXXXXX.db)
if ! sqlite3 "$PROD_DATA/database.db" ".backup '$TMP'" 2>>"$LOG"; then
    log "错误：无法从正式服取快照（游戏是否在运行？）"
    rm -f "$TMP"
    exit 1
fi
if ! sqlite3 "$TMP" "PRAGMA integrity_check;" 2>>"$LOG" | grep -q '^ok$'; then
    log "错误：快照完整性校验失败"
    rm -f "$TMP"
    exit 1
fi
PLAYERS=$(sqlite3 "$TMP" "SELECT count(*) FROM players;" 2>/dev/null || echo '?')
log "快照校验通过（players $PLAYERS 行，$(du -h "$TMP" | cut -f1)）"

install -m 660 -o mud -g mudmod "$TMP" "$TEST_DATA/database.db"
rm -f "$TMP"
log "已用正式服快照替换测试库"

# ── 3. 可选：重置测试服角色数据（data/100）───────────────────────
if [ "$WITH_DATA" = "1" ]; then
    if [ -d "$PROD_DATA/100" ]; then
        rsync -a --delete "$PROD_DATA/100/" "$TEST_DATA/100/" 2>>"$LOG" \
            && log "已重置测试服角色数据 data/100（取自正式服的 data/100）" \
            || log "重置 data/100 失败"
    else
        log "正式服没有 data/100，跳过角色数据重置"
    fi
else
    log "保留测试服现有角色数据（未指定 --with-data）"
fi

chown -R mud:mudmod "$TEST_DATA" 2>/dev/null || true
chmod 660 "$TEST_DATA/database.db" 2>/dev/null || true

# ── 4. 重启测试服使其重新打开数据库 ──────────────────────────
if sudo -u mud env PM2_HOME=/home/mud/.pm2 pm2 restart mud-game-test >>"$LOG" 2>&1; then
    log "已重启测试服"
else
    log "重启测试服失败，请手动检查"
fi

log "完成。测试库：$TEST_DATA/database.db"
