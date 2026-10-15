#!/bin/bash
# MUD Server Restart Script
set -e

PM2_BIN="/usr/bin/pm2"
NODE_BIN="/usr/bin/node"

echo "=== 停止所有 MUD 进程 ==="

# 1. 通过 PM2 停止 (mud 用户)
PM2_HOME=/home/mud/.pm2 sudo -u mud "$NODE_BIN" "$PM2_BIN" stop all 2>/dev/null || true
PM2_HOME=/home/mud/.pm2 sudo -u mud "$NODE_BIN" "$PM2_BIN" kill 2>/dev/null || true

# 2. 通过 PM2 停止 (root 用户 — 可能有残留)
export PM2_HOME=/root/.pm2
"$NODE_BIN" "$PM2_BIN" stop all 2>/dev/null || true
"$NODE_BIN" "$PM2_BIN" kill 2>/dev/null || true

# 3. 直接杀死所有 MUD 进程，确保不留残留
# 3. 优雅退出：先通过 Admin IPC 触发保存
echo "=== 通知服务端保存数据 ==="
for port in 31303 31304; do
    curl -s -m 3 "http://127.0.0.1:$port/api/shutdown" 2>/dev/null && echo "  Port $port: 已保存" || echo "  Port $port: 跳过"
done
sleep 2

# 4. 发 SIGINT（可被捕获做优雅退出），超时后再 SIGKILL
pkill -INT -f "node /home/mud/mud/main.js" 2>/dev/null || true
pkill -INT -f "node /home/mud/mud/web.js" 2>/dev/null || true
sleep 3

# 5. 未退出则强制 SIGKILL
if pgrep -f "node /home/mud/mud/(main|web)\.js" > /dev/null; then
    echo "进程未响应，强制终止..."
    pkill -9 -f "node /home/mud/mud/main.js" 2>/dev/null || true
    pkill -9 -f "node /home/mud/mud/web.js" 2>/dev/null || true
    sleep 1
fi

# 6. 二次确认
if pgrep -f "node /home/mud/mud/(main|web)\.js" > /dev/null; then
    echo "仍有残留，最后清理..."
    pkill -9 -f "node /home/mud/mud/(main|web)\.js" || true
    sleep 1
fi

echo "=== 启动 MUD 服务（测试服 + 正式服 + Web）==="
# 统一用 mud 用户启动
PM2_HOME=/home/mud/.pm2 sudo -u mud "$NODE_BIN" "$PM2_BIN" start /home/mud/mud/ecosystem.config.js

sleep 3
PM2_HOME=/home/mud/.pm2 sudo -u mud "$NODE_BIN" "$PM2_BIN" status
echo "=== 重启完成（应显示 mud-game-test, mud-game, mud-web 三个进程）==="
