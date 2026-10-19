#!/bin/bash
# 一次性改造：把测试服的 data 从"指向正式服的软链接"改成独立真实目录
#
# 改造后布局：
#   /home/mud/mud-test/data/          ← 真实目录（测试服专用）
#       database.db                   ← 独立数据库（从正式服快照播种）
#       100/                          ← 测试服角色运行数据（sid=100）
#       def/ db.js sql.js bak/ chatlog/ backup/
#
# 保留共享：
#   node_modules → 正式服（省 129MB，且依赖必须一致）
#   .env         → 正式服（端口/密钥一致，避免令牌格式不兼容）
#   log          → 正式服（pm2 日志路径写死在 ecosystem 里，改成独立目录无实际效果）
set -uo pipefail

PROD=/home/mud/mud
PROD_DATA=$PROD/data
TEST=/home/mud/mud-test
TEST_DATA=$TEST/data
LOG=/var/log/mud-test-db.log

step() { printf '\n[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$LOG"; }

[ "$(id -u)" -eq 0 ] || { echo "请用 root 执行" >&2; exit 1; }

if [ -d "$TEST_DATA" ] && [ ! -L "$TEST_DATA" ]; then
    step "测试服 data 已经是真实目录，无需改造"
    exit 0
fi

step "1. 停止测试服（避免改造过程中写入）"
sudo -u mud env PM2_HOME=/home/mud/.pm2 pm2 stop mud-game-test >>"$LOG" 2>&1 && step "   已停止" || step "   停止失败（继续）"

step "2. 移除软链接，建立真实目录"
if [ -L "$TEST_DATA" ]; then
    rm -f "$TEST_DATA"
    step "   已删除软链接（原指向 $(readlink -f "$PROD_DATA")）"
fi
install -d -m 775 -o mud -g mudmod "$TEST_DATA"

step "3. 复制运行时资源（小文件）"
for item in db.js sql.js def chatlog bak; do
    if [ -e "$PROD_DATA/$item" ]; then
        cp -a "$PROD_DATA/$item" "$TEST_DATA/" 2>>"$LOG" && step "   ✓ $item"
    fi
done
install -d -m 775 -o mud -g mudmod "$TEST_DATA/backup"

step "4. 从正式服取一致快照作为测试库"
TMP=$(mktemp /tmp/seed-XXXXXX.db)
if sqlite3 "$PROD_DATA/database.db" ".backup '$TMP'" 2>>"$LOG" \
   && sqlite3 "$TMP" "PRAGMA integrity_check;" 2>/dev/null | grep -q '^ok$'; then
    install -m 660 -o mud -g mudmod "$TMP" "$TEST_DATA/database.db"
    step "   ✓ 快照已就位（players $(sqlite3 "$TEST_DATA/database.db" 'SELECT count(*) FROM players;' 2>/dev/null || echo '?') 行）"
else
    step "   ✗ 快照失败 —— 将创建空库由游戏自行初始化"
    install -d -m 775 -o mud -g mudmod "$TEST_DATA"
fi
rm -f "$TMP"

step "5. 复制测试服自己的角色运行数据（sid=100）"
if [ -d "$PROD_DATA/100" ]; then
    rsync -a "$PROD_DATA/100/" "$TEST_DATA/100/" 2>>"$LOG" && step "   ✓ data/100 已复制"
fi

step "6. 权限与属主"
chown -R mud:mudmod "$TEST_DATA" 2>/dev/null
chmod 775 "$TEST_DATA" 2>/dev/null
find "$TEST_DATA" -type f -name '*.db' -exec chmod 660 {} + 2>/dev/null
step "   $(stat -c '%a %U:%G' "$TEST_DATA")"

step "7. 校验：两者不再是同一文件"
P=$(stat -c %i "$PROD_DATA/database.db" 2>/dev/null || echo x)
T=$(stat -c %i "$TEST_DATA/database.db" 2>/dev/null || echo x)
step "   正式库 inode=$P   测试库 inode=$T"
if [ "$P" = "$T" ] && [ "$P" != "x" ]; then
    step "   ✗ 仍是同一文件，改造失败"
    exit 1
fi
step "   ✓ 已隔离"

step "8. 重启测试服"
sudo -u mud env PM2_HOME=/home/mud/.pm2 pm2 restart mud-game-test >>"$LOG" 2>&1
sleep 8
if curl -s -m 6 http://127.0.0.1:31303/health >/dev/null 2>&1; then
    step "   ✓ 测试服已恢复"
else
    step "   ! 测试服未在 8 秒内响应，请检查 log/pm2-game-test-error.log"
fi

step "完成"
