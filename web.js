const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const pinoHttp = require('pino-http');
require('dotenv').config();
globalThis['__CONFIG'] = require('./config');

__CONFIG.init();

const app = express();
const PORT = __CONFIG.WEB_PORT;

// CORS - 允许 APK WebView 跨域请求
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const API_PATHS = ['./api/user', './api/game', './api/admin'];
const APIS = {
};

for (let api of API_PATHS) {
    APIS[api.replace('./api/', "")] = require(api);
}


app.use(express.static(path.join(__dirname, 'www')));


app.disable('x-powered-by');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
    secret: __CONFIG.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 30,
        // sameSite: 'none'
    }
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(pinoHttp({
    level: 'info',
    transport: {
        target: 'pino-roll',
        options: {
            file: './log/access.log',
            frequency: 'daily',
            mkdir: true,
            history: '7d',
        },
    },
}));

app.all('/api/:className/:methodName', async (req, res) => {
    const { className, methodName } = req.params;
    try {
        const ClassModule = APIS[className];
        if (!ClassModule)
            return res.status(404).json({ error: 'Method not found' });
        const instance = new ClassModule(req, res);
        if (typeof instance[methodName] !== 'function') {
            return res.status(404).json({ error: 'Method not found' });
        }
        const params = { ...req.query, ...req.body };

        const result = await instance[methodName](params);

        res.json(result);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.all('/sse/:className/:methodName', async (req, res) => {
    const { className, methodName } = req.params;
    try {
        const ClassModule = APIS[className];
        if (!ClassModule)
            return res.status(404).json({ error: 'Method not found' });
        const instance = new ClassModule(req, res);
        if (typeof instance[methodName] !== 'function') {
            return res.status(404).json({ error: 'Method not found' });
        }
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        const handler = await instance[methodName]({ ...req.query, ...req.body });
        if (!res.writableEnded) {
            if (handler && handler.end) {
                const closeHandler = () => {
                    handler.end();
                };
                res.on('close', closeHandler);
            } else {
                res.end();
            }
        }
    } catch (error) {
        console.error('API Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});


function reload_api(req, res) {
    try {
        for (let modulePath of API_PATHS) {
            const resolvedPath = require.resolve(modulePath);
            if (require.cache[resolvedPath]) {
                delete require.cache[resolvedPath];
            }
            APIS[modulePath.replace('./api/', "")] = require(resolvedPath);
        }
        res.json({ msg: 'api reload' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
app.use("/reload", reload_api);
app.use("/admin", express.static(path.join(__dirname, 'www', 'admin')));

const http = require('http');
const net = require('net');
const crypto = require('crypto');
const server = http.createServer(app);

// WebSocket代理：将WSS连接转发到游戏服务器
// URL路径 /ws/100 → 测试服, /ws/200 → 正式服, 默认 → def_server
server.on('upgrade', (req, clientSocket, head) => {
    var wsPort = __CONFIG.def_server.port;
    var urlPath = (req.url || '/').split('?')[0];
    var wsMatch = urlPath.match(/^\/ws\/(\d+)$/);
    if (wsMatch) {
        var sid = parseInt(wsMatch[1]);
        var servers = __CONFIG.def_servers || [];
        for (var i = 0; i < servers.length; i++) {
            if (servers[i].id === sid) {
                wsPort = servers[i].port;
                break;
            }
        }
    }

    // 重建HTTP升级请求转发给游戏服务器（需还原大小写，net-ws.js的readHeader区分大小写）
    var headerCase = {
        'sec-websocket-key': 'Sec-WebSocket-Key',
        'sec-websocket-version': 'Sec-WebSocket-Version',
        'sec-websocket-protocol': 'Sec-WebSocket-Protocol',
        'sec-websocket-extensions': 'Sec-WebSocket-Extensions',
        'sec-websocket-accept': 'Sec-WebSocket-Accept',
        'upgrade': 'Upgrade',
        'connection': 'Connection',
        'host': 'Host',
        'origin': 'Origin',
    };
    var upgradeReq = ['GET ' + (req.url || '/') + ' HTTP/1.1'];
    for (var key in req.headers) {
        var headerKey = headerCase[key] || key;
        upgradeReq.push(headerKey + ': ' + req.headers[key]);
    }
    upgradeReq.push('\r\n');
    upgradeReq = upgradeReq.join('\r\n');

    const targetSocket = net.connect(wsPort, '127.0.0.1', () => {
        targetSocket.write(upgradeReq);

        var handshakeBuf = Buffer.alloc(0);
        var handshakeDone = false;

        targetSocket.on('data', function onData(data) {
            if (!handshakeDone) {
                handshakeBuf = Buffer.concat([handshakeBuf, data]);
                var str = handshakeBuf.toString();
                var idx = str.indexOf('\r\n\r\n');
                if (idx >= 0) {
                    handshakeDone = true;
                    targetSocket.removeListener('data', onData);

                    // 回复客户端101握手
                    const acceptKey = crypto.createHash('sha1')
                        .update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
                        .digest('base64');
                    clientSocket.write(
                        'HTTP/1.1 101 Switching Protocols\r\n' +
                        'Upgrade: websocket\r\n' +
                        'Connection: Upgrade\r\n' +
                        'Sec-WebSocket-Accept: ' + acceptKey + '\r\n\r\n'
                    );

                    // 转发游戏服务器101响应后的剩余数据给客户端
                    var remaining = handshakeBuf.slice(idx + 4);
                    if (remaining.length > 0) clientSocket.write(remaining);

                    // 转发客户端WebSocket帧给游戏服务器
                    if (head && head.length > 0) targetSocket.write(head);

                    // 建立双向管道
                    targetSocket.pipe(clientSocket);
                    clientSocket.pipe(targetSocket);
                }
            }
        });
    });
    targetSocket.on('error', () => clientSocket.destroy());
    clientSocket.on('error', () => targetSocket.destroy());
});

// 健康检查端点
app.get('/health', function (req, res) {
    var players = (global.WORLD && WORLD.USERS) ? WORLD.USERS.length : 0;
    var mem = process.memoryUsage();
    var uptime = Math.floor(process.uptime());
    res.json({ status: 'ok', uptime: uptime, uptimeStr: Math.floor(uptime/86400)+'d '+Math.floor(uptime%86400/3600)+'h '+Math.floor(uptime%3600/60)+'m', players: players, memory: { heapMB: Math.round(mem.heapUsed/1048576), rssMB: Math.round(mem.rss/1048576) }, pid: process.pid });
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Static files served from ${path.join(__dirname, 'www')}`);
});

process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);

});
process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
});
