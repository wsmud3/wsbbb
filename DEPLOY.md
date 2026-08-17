# MUD 游戏 - 阿里云服务器部署手册

本手册适用于 **阿里云 ECS 2vCPU / 4GB 内存** 配置，操作系统推荐 **Ubuntu 24.04 LTS**。

---

## 目录

1. [服务器基础配置](#1-服务器基础配置)
2. [环境安装](#2-环境安装)
3. [项目部署](#3-项目部署)
4. [进程管理](#4-进程管理)
5. [Nginx 反向代理（可选）](#5-nginx-反向代理可选)
6. [运维管理](#6-运维管理)
7. [故障排查](#7-故障排查)

---

## 1. 服务器基础配置

### 1.1 登录服务器

购买 ECS 后，在阿里云控制台找到实例的**公网 IP**，用 SSH 登录：

```bash
ssh root@<你的公网IP>
```

> 如果使用密码登录，初始密码会在购买时设置（或通过控制台重置）。

### 1.2 创建普通用户（安全最佳实践）

```bash
# 创建用户
adduser mud

# 添加 sudo 权限
usermod -aG sudo mud

# 切换到 mud 用户
su - mud
```

后续所有操作建议使用 `mud` 用户，需要 root 时加 `sudo`。

### 1.3 配置安全组（阿里云控制台操作）

登录 [阿里云控制台](https://ecs.console.aliyun.com/) → 实例 → 安全组 → 配置规则，添加以下入方向规则：

| 端口 | 协议 | 源 IP | 说明 |
|------|------|-------|------|
| 22 | TCP | 你的IP/32 | SSH 登录（建议限制 IP） |
| 80 | TCP | 0.0.0.0/0 | HTTP（如果配置域名） |
| 443 | TCP | 0.0.0.0/0 | HTTPS（如果配置 SSL） |
| 8088 | TCP | 0.0.0.0/0 | Web 游戏入口 |

> **注意**：`WS_PORT=31300` 和 `IPC_PORT=31301` 只需本机通信，**不需要**对外开放！

### 1.4 系统基础更新

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential python3
```

---

## 2. 环境安装

### 2.1 安装 Node.js

项目要求 **Node.js >= 24.10.0**。推荐使用 nvm 管理：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc

# 安装 Node.js 24 LTS
nvm install 24

# 验证版本
node --version    # 应显示 v24.x.x
npm --version
```

### 2.2 安装构建工具

`better-sqlite3` 是原生模块，需要 C++ 编译环境：

```bash
sudo apt install -y gcc g++ make
```

### 2.3 安装 PM2（进程管理器）

```bash
npm install -g pm2
```

---

## 3. 项目部署

### 3.1 上传项目

**方式 A：使用 Git（推荐）**

首先在本地项目目录初始化 Git（如果还没有）：

```bash
# === 在本地 Windows 机器上执行 ===
cd D:\mud

# 创建 .gitignore
echo node_modules/ > .gitignore
echo log/ >> .gitignore
echo data/backup/ >> .gitignore
echo .vs/ >> .gitignore
echo .env >> .gitignore

# 初始化并推送（可用 GitHub 私有仓库或 Gitee）
git init
git add .
git commit -m "initial commit"
# 推送到远程仓库后，在服务器上 clone
```

在服务器上 clone：

```bash
# === 在服务器上执行 ===
cd /home/mud
git clone <你的仓库地址> mud
cd mud
```

**方式 B：使用 SCP 上传**

```bash
# === 在本地 Windows 上执行（PowerShell） ===
# 先排除 node_modules 和 log 目录
scp -r D:\mud\ root@<服务器IP>:/home/mud/
```

### 3.2 安装依赖

```bash
cd /home/mud
npm install
```

> 如果 `better-sqlite3` 编译失败，可能是缺 `build-essential`，重新 `sudo apt install -y build-essential` 后再试。

### 3.3 配置生产环境变量

```bash
# 复制 .env 模板，按生产环境修改
cp .env .env.production
nano .env.production
```

**生产环境 `.env` 配置示例**：

```env
# Web 服务器端口
WEB_PORT=8088

# 游戏服务器 WebSocket 端口（仅本机通信，不对外开放）
WS_PORT=31300

# MD5 加密前缀（务必修改！）
MD5_PREFIX=替换为随机字符串至少16位

# Session 会话密钥（务必修改！）
SESSION_SECRET=替换为随机字符串至少32位

# DES 加密向量（16字节，务必修改！）
DESIV=替换为16字节随机字符串

# Admin IPC 密钥（务必修改！）
ADMIN_IPC_SECRET=替换为随机字符串至少32位
```

> ⚠️ **安全警告**：生产环境**必须**修改 `MD5_PREFIX`、`SESSION_SECRET`、`DESIV`、`ADMIN_IPC_SECRET`，否则密码加密和会话安全形同虚设。

生成随机密钥的方法：

```bash
# 生成随机字符串
openssl rand -hex 16   # 32位十六进制
openssl rand -hex 32   # 64位十六进制
```

### 3.4 构建前端

```bash
npm run build
```

构建产物在 `www/` 目录下。如果报错，确保 Vite 依赖安装完整。

### 3.5 本地测试启动

在上 PM2 之前，先手动测试项目能否运行：

```bash
# 在两个终端中分别启动
# 终端1：启动游戏服务器
node main.js

# 终端2：启动 Web 服务器
node web.js
```

访问 `http://<服务器IP>:8088` ，确认能看到游戏页面。

> 如果一切正常，按 `Ctrl+C` 停止两个进程。

---

## 4. 进程管理

### 4.1 创建 PM2 配置文件

在项目根目录创建 `ecosystem.config.js`：

```js
module.exports = {
  apps: [
    {
      name: 'mud-game',
      script: 'main.js',
      cwd: '/home/mud/mud',
      env: {
        NODE_ENV: 'production',
      },
      // 自动加载 .env 文件（按优先顺序）
      env_file: './.env.production',
      // 日志
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './log/pm2-game-error.log',
      out_file: './log/pm2-game-out.log',
      // 重启策略
      max_restarts: 10,
      restart_delay: 5000,
      // 内存限制（超过 800MB 自动重启）
      max_memory_restart: '800M',
      // 监听文件变化不自动重启（游戏服靠热更新）
      watch: false,
    },
    {
      name: 'mud-web',
      script: 'web.js',
      cwd: '/home/mud/mud',
      env: {
        NODE_ENV: 'production',
      },
      env_file: './.env.production',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './log/pm2-web-error.log',
      out_file: './log/pm2-web-out.log',
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: '500M',
      watch: false,
    },
  ],
};
```

### 4.2 启动与常用命令

```bash
# 启动全部服务
pm2 start ecosystem.config.js

# 查看运行状态
pm2 status

# 查看日志
pm2 logs mud-game
pm2 logs mud-web

# 重启
pm2 restart all

# 停止
pm2 stop all

# 删除
pm2 delete all
```

### 4.3 设置开机自启

```bash
# 生成启动脚本
pm2 startup

# 执行上面输出的命令（需要 sudo）
# 示例：sudo env PATH=$PATH:/home/mud/.nvm/versions/node/v24.x.x/bin pm2 startup systemd -u mud --hp /home/mud

# 保存当前进程列表
pm2 save
```

### 4.4 优雅关服

由于游戏服务器需要保存玩家数据后再退出，按以下步骤停止：

```bash
# 方法1：API 安全关服（推荐，会先保存数据）
curl -X POST http://localhost:8088/api/admin/safe_shutdown

# 方法2：发送 SIGINT 信号（main.js 会拦截并保存数据）
pm2 stop mud-game   # PM2 默认先发 SIGINT，等待后发 SIGKILL
```

> PM2 默认给进程 1600ms 关闭窗口。如果数据量大需要更长时间，在 `ecosystem.config.js` 中增加：
> ```js
> kill_timeout: 10000,  // 给 10 秒保存数据
> ```

---

## 5. Nginx 反向代理（可选）

如果希望通过 80/443 端口访问（不需要输入 :8088），安装 Nginx：

```bash
sudo apt install -y nginx
```

### 5.1 配置反向代理

```bash
sudo nano /etc/nginx/sites-available/mud
```

```nginx
server {
    listen 80;
    server_name <你的域名或IP>;

    # 日志
    access_log /var/log/nginx/mud-access.log;
    error_log /var/log/nginx/mud-error.log;

    # 代理到 Web 服务器
    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持（游戏连接需要）
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 静态资源缓存
    location /assets/ {
        proxy_pass http://127.0.0.1:8088;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 健康检查不需要记录日志
    location /health {
        proxy_pass http://127.0.0.1:8088;
        access_log off;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/mud /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default   # 可选：删除默认站点

# 检查配置
sudo nginx -t

# 重载
sudo systemctl reload nginx
```

### 5.2 配置 HTTPS（推荐）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 自动配置 SSL（需要域名已解析到服务器）
sudo certbot --nginx -d <你的域名>

# 设置自动续期
sudo certbot renew --dry-run
```

---

## 6. 运维管理

### 6.1 项目结构

```
/home/mud/mud/
├── main.js            # 游戏引擎主进程（WebSocket :31300）
├── web.js             # Web 服务器主进程（HTTP :8088）
├── os/                # 游戏核心引擎
├── world/             # 游戏世界内容（地图、NPC、技能、物品）
├── world/extends/     # 扩展内容（支持热更新）
├── src/               # 前端源码
├── www/               # 前端构建产物（静态文件）
├── api/               # Web API
├── data/              # SQLite 数据库 + 游戏存档
├── log/               # 日志
├── .env               # 环境变量
└── ecosystem.config.js # PM2 配置
```

### 6.2 端口说明

| 端口 | 进程 | 用途 | 是否对外 |
|------|------|------|----------|
| 8088 | web.js | HTTP Web 服务 + WebSocket 代理 | ✅ 对外 |
| 31300 | main.js | 游戏 WebSocket 服务 | ❌ 仅本机 |
| 31301 | main.js | Admin IPC 内部 API | ❌ 仅本机 |

### 6.3 常用运维命令

```bash
# === 服务状态 ===
pm2 status                          # 查看进程状态
pm2 monit                           # 实时监控（CPU/内存）
curl http://localhost:8088/health   # 健康检查

# === 日志 ===
pm2 logs mud-game --lines 50        # 查看最近50行游戏日志
pm2 logs mud-web --lines 50         # 查看最近50行 Web 日志
tail -f log/access.log              # 查看访问日志

# === 重启 ===
pm2 restart mud-game                # 重启游戏服
pm2 restart mud-web                 # 重启 Web 服
pm2 restart all                     # 全部重启

# === 更新代码后 ===
cd /home/mud/mud
git pull                            # 拉取最新代码
npm install                         # 更新依赖（如有新增）
npm run build                       # 重新构建前端
pm2 restart all                     # 重启服务
```

### 6.4 游戏热更新

在游戏内使用 GM 命令或通过管理面板，无需重启服务器：

```javascript
// 热更新 world/extends/ 下的文件
SendCommand("update extends/your_file")

// 热更新所有命令脚本
SendCommand("update cmd/admin/test")
```

也可以通过 API 触发：

```bash
curl -X POST http://localhost:8088/api/game/hot_reload \
  -H "Content-Type: application/json" \
  -d '{"target": "all"}'
```

### 6.5 数据库备份

游戏每小时自动备份一次存档到 `data/backup/` 目录。管理面板也支持手动备份和回滚。

手动备份：

```bash
# 备份 SQLite 数据库
cp /home/mud/mud/database.db /home/mud/backups/database_$(date +%Y%m%d_%H%M).db

# 备份游戏存档
cp /home/mud/mud/data/data.js /home/mud/backups/data_$(date +%Y%m%d_%H%M).js
```

建议配置定时备份：

```bash
# 添加 crontab，每天凌晨 3 点备份
crontab -e

# 添加以下行
0 3 * * * cp /home/mud/mud/database.db /home/mud/backups/database_$(date +\%Y\%m\%d).db
0 3 * * * cp /home/mud/mud/data/data.js /home/mud/backups/data_$(date +\%Y\%m\%d).js
```

### 6.6 监控告警

PM2 自带基础监控，也可以接入 `pm2.io` 云监控：

```bash
# PM2 监控面板
pm2 monit

# 接入 PM2 云端监控（免费）
pm2 link <secret> <public>
```

---

## 7. 故障排查

### 7.1 服务无法启动

```bash
# 检查端口是否被占用
sudo lsof -i :8088
sudo lsof -i :31300

# 查看 PM2 错误日志
pm2 logs mud-game --lines 100 --err
pm2 logs mud-web --lines 100 --err

# 手动启动查看完整错误
cd /home/mud/mud
node main.js   # 看报错信息
```

### 7.2 better-sqlite3 编译失败

```bash
# 确认有编译工具
sudo apt install -y build-essential python3

# 清除重装
rm -rf node_modules package-lock.json
npm install
```

### 7.3 内存不足

2GB 内存下如果玩家较多（>50 在线），可能需要调整 Node.js 内存上限：

```bash
# 在 PM2 配置中设置
node_args: '--max-old-space-size=1024'   # 限制 1GB
```

或者手动启动：

```bash
NODE_OPTIONS="--max-old-space-size=1024" node main.js
```

### 7.4 WebSocket 连接失败

检查客户端 WebSocket 配置是否指向正确的地址。在 `src/` 源码中搜索 WebSocket 连接地址，确保指向服务器公网 IP 或域名。

### 7.5 默认管理员账号

- 用户名：`administrator`
- 密码：`123456`

> ⚠️ 部署后**请立即修改**默认管理员密码！

---

## 附录：快速部署检查清单

- [ ] 服务器创建普通用户 `mud`
- [ ] 安全组开放 8088（和 80/443）端口
- [ ] 安装 Node.js >= 24.10.0
- [ ] 安装构建工具（build-essential）
- [ ] 克隆项目代码
- [ ] 执行 `npm install`
- [ ] 修改 `.env` 中所有密钥为随机值
- [ ] 执行 `npm run build` 构建前端
- [ ] 创建 `ecosystem.config.js` PM2 配置
- [ ] `pm2 start ecosystem.config.js` 启动服务
- [ ] `curl http://localhost:8088/health` 确认健康
- [ ] 浏览器访问 `http://<服务器IP>:8088` 确认可打开
- [ ] `pm2 save && pm2 startup` 设置开机自启
- [ ] 修改默认管理员密码
- [ ] 配置数据备份策略
- [ ] （可选）配置 Nginx 反向代理 + HTTPS + 域名
