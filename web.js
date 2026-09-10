const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const pinoHttp = require('pino-http');
require('dotenv').config();
globalThis['__CONFIG'] = require('./config');

const app = express();
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY);
app.use(require('./api/rate-limit'));
const PORT = __CONFIG.WEB_PORT;

// CORS - 允许 APK WebView 跨域请求
app.use((req, res, next) => {
  const origin = req.get('origin');
  const configuredOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const sameOrigin = origin && origin === (req.protocol + '://' + req.get('host'));
  const localApp = origin && /^(capacitor|ionic|http):\/\/localhost(?::\d+)?$/i.test(origin);
  const allowed = origin && (sameOrigin || localApp || configuredOrigins.indexOf(origin) >= 0);
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  if (origin && !allowed && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return res.sendStatus(403);
  next();
});

const API_PATHS = ['./api/user', './api/game', './api/admin'];
const APIS = {
};

for (let api of API_PATHS) {
    APIS[api.replace('./api/', "")] = require(api);
}


app.use(express.static(path.join(__dirname, 'www'), {
    // index.html 引用 Vite 生成的哈希 bundle；入口禁止缓存，避免浏览器或 APK
    // WebView 一直使用旧入口而看不到已构建的新前端。
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        }
    }
}));


app.disable('x-powered-by');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
    secret: __CONFIG.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.COOKIE_SECURE === 'true',
        // The session contains administrator authentication state.  It is
        // only sent automatically by the browser and must not be readable by
        // page scripts (the admin UI uses fetch credentials, not the cookie
        // value itself).
        httpOnly: true,
        maxAge: 1000 * 60 * 30,
        sameSite: 'lax'
    }
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(pinoHttp({
    level: 'info',
    redact: ['req.headers.cookie', 'req.headers.authorization', 'req.headers["x-api-reload-token"]', 'req.headers["x-health-token"]'],
    serializers: { req(req) { return { method: req.method, url: String(req.url || '').split('?')[0] }; } },
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

const apiRoutes = require('./api/routes');
const SAFE_GET_METHODS = apiRoutes.READ;
const acceptsApiMethod = apiRoutes.allowed;

app.all('/api/:className/:methodName', async (req, res) => {
    const { className, methodName } = req.params;
    try {
        const ClassModule = APIS[className];
        if (!ClassModule || !apiRoutes.exposed(className, methodName))
            return res.status(404).json({ error: 'Method not found' });
        if (!acceptsApiMethod(className, methodName, req.method)) {
            res.setHeader('Allow', SAFE_GET_METHODS.has(className + '.' + methodName) ? 'GET, POST' : 'POST');
            return res.status(405).json({ error: 'Method not allowed' });
        }
        const instance = new ClassModule(req, res);
        if (!apiRoutes.exposed(className, methodName) || typeof instance[methodName] !== 'function') {
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
// No API currently defines a streaming endpoint. Never dispatch writes through GET SSE.
app.all('/sse/:className/:methodName', (req, res) => res.status(404).json({ error: 'Method not found' }));

function reload_api(req, res) {
    // Keep reload useful for an explicitly authenticated administrator while
    // preventing an unauthenticated public endpoint.  A deployment token can
    // be used by local tooling without exposing a user session.
    var token = process.env.API_RELOAD_TOKEN;
    var supplied = req.get('x-api-reload-token');
    var authorized = !!token && supplied && supplied === token;
    if (!authorized) {
        try {
            var admin = new APIS.admin(req, res);
            admin._requireAdmin();
            authorized = true;
        } catch (e) {
            return res.status(403).json({ error: 'Forbidden' });
        }
    }
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
app.post("/reload", reload_api);
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

    clientSocket.pause();
    const targetSocket = net.connect(wsPort, '127.0.0.1', () => {
        targetSocket.write(upgradeReq);
    });
    const cleanup = () => { targetSocket.destroy(); clientSocket.destroy(); };
    const timer = setTimeout(cleanup, 10000);
    let handshakeBuf = Buffer.alloc(0);
    const onData = data => {
        handshakeBuf = Buffer.concat([handshakeBuf, data]);
        const idx = handshakeBuf.indexOf('\r\n\r\n');
        if (idx < 0) { if (handshakeBuf.length > 16384) cleanup(); return; }
        if (idx > 16384 || !/^HTTP\/1\.[01] 101(?: |\r)/.test(handshakeBuf.toString('ascii', 0, idx))) { cleanup(); return; }
        clearTimeout(timer);
        targetSocket.removeListener('data', onData);
        // Forward the validated backend response; never invent a successful upgrade.
        clientSocket.write(handshakeBuf);
        if (head && head.length) targetSocket.write(head);
        targetSocket.pipe(clientSocket);
        clientSocket.pipe(targetSocket);
        clientSocket.resume();
    };
    targetSocket.on('data', onData);
    targetSocket.on('error', cleanup);
    clientSocket.on('error', cleanup);
    targetSocket.on('close', () => { clearTimeout(timer); clientSocket.destroy(); });
    clientSocket.on('close', () => { clearTimeout(timer); targetSocket.destroy(); });
});

// 健康检查端点
const bootRelease = require('./os/release');
app.get('/health', function (req, res) {
    // Keep the liveness probe public, but do not leak player counts, memory
    // usage, or the process ID.  Detailed diagnostics require an explicit
    // deployment-only token and are not needed by the normal health check.
    var body = { status: 'ok', release: bootRelease, service: 'web' };
    if (require('./os/test-scope')) body.testScope = require('./os/test-scope');
    var healthToken = process.env.HEALTH_TOKEN || '';
    if (healthToken.length >= 16 && req.get('x-health-token') === healthToken) {
        var players = (global.WORLD && WORLD.USERS) ? WORLD.USERS.length : 0;
        var mem = process.memoryUsage();
        var uptime = Math.floor(process.uptime());
        body.uptime = uptime;
        body.uptimeStr = Math.floor(uptime / 86400) + 'd ' + Math.floor(uptime % 86400 / 3600) + 'h ' + Math.floor(uptime % 3600 / 60) + 'm';
        body.players = players;
        body.memory = { heapMB: Math.round(mem.heapUsed / 1048576), rssMB: Math.round(mem.rss / 1048576) };
        body.pid = process.pid;
    }
    res.json(body);
});

// 启动服务器
// Start listening only after configuration validation and the database
// connection have completed.  Previously init() was fire-and-forget, so a
// fast first request could reach APIs with an unopened DB (or the process
// could expose a white page after a configuration failure).
async function startWeb() {
    try {
        await __CONFIG.init();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Static files served from ${path.join(__dirname, 'www')}`);
        });
    } catch (error) {
        console.error('Web service startup failed:', error && error.message ? error.message : error);
        process.exitCode = 1;
    }
}
startWeb();

process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);

});
process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
});
