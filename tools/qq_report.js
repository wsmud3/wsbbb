#!/usr/bin/env node
/**
 * QQ 异常/日报推送 —— 通过 NapCat(OneBot 11) 把服务器状态发到指定 QQ。
 *
 * 由 /home/mud/bin/qq-push.sh（root cron，每分钟）调用。
 *
 * 推送内容（三类，各自独立，互不影响）：
 *   ① 异常告警：log/fatal_*.log 新增的未捕获异常、两服 pm2 错误日志新增行、
 *      pm2 重启次数增长、部署失败。**这是"我不在服务器也能知道出事了"的核心。**
 *   ② 部署结果：deploy/pull.sh 每次成功/失败。
 *   ③ 日报：每天固定时间一条状态摘要（版本、账号数、在线数、今日错误数、磁盘内存）。
 *
 * 设计原则：
 *   - 只读日志，绝不修改游戏文件
 *   - 用状态文件记录已推送到哪个位置，避免重复轰炸；状态损坏时自动重建而不再刷屏
 *   - 任何失败都不影响游戏；发不出去就留着下轮重试（最多重试到超过积压上限）
 *   - 消息里的敏感信息（密码/token）会被脱敏
 */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');

const MUD = '/home/mud/mud';
const LOG_DIR = path.join(MUD, 'log');
const STATE_DIR = '/var/lib/mud-qqbot';
const ENV_FILE = '/etc/napcat/onebot.env';
const STATE_FILE = path.join(STATE_DIR, 'state.json');

const MAX_LINES_PER_MESSAGE = 18;      // 单条消息最多带多少行日志
const MAX_MESSAGE_CHARS = 1200;        // 单条消息最长字符数
const BACKLOG_MAX = 40;          // 单轮最多推送条数
// 以下是防止"消息风暴"的硬闸门。风控角度：短时间内给同一账号连发大量消息
// 是第三方客户端被判定为异常行为最常见的原因，因此宁可少发也不刷屏。
// 分类配额：一刀切的上限会掩盖问题（也曾经把正常告警挤掉）。按重要性分级：
//   fatal 严重异常 —— 不设上限，这类绝不能因配额丢掉
//   服务错误/重启 —— 合并后每天个位数，给 40 条余量
//   部署/日报     —— 8 条足够
const QUOTA = { fatal: Infinity, service: 40, info: 8 };
const STATE_GUARD = '/var/lib/mud-qqbot/state.json';                // 单轮最多推送多少条（防止积压后刷屏）

// ───────────────────────── 基础设施 ─────────────────────────

function ensureDirs() {
    try { fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 }); } catch (_) { }
}

function loadEnvFile(p) {
    const out = {};
    try {
        for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
            const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
            if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
        }
    } catch (_) { }
    return out;
}

function loadState() {
    try {
        const s = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        if (s && typeof s === 'object') return s;
    } catch (_) { }
    // 首次运行或状态损坏：重建。此时把所有日志位置设到"当前末尾"，
    // 避免第一次就把历史日志全部推给用户（那会变成刷屏）。
    return { offsets: {}, restarts: {}, lastDigest: '', deployRef: '', initialized: false, rebuiltAt: Date.now() };
}

function saveState(s) {
    try {
        const tmp = STATE_FILE + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(s, null, 2), { mode: 0o600 });
        fs.renameSync(tmp, STATE_FILE);
    } catch (_) { }
}

function fileSize(p) {
    try { return fs.statSync(p).size; } catch (_) { return 0; }
}

/** 从 offset 起读取新增内容（按行）。文件被截断/轮转时返回 {lines:[], newOffset:size} */
function readNewLines(p, offset) {
    const size = fileSize(p);
    if (size === 0) return { lines: [], newOffset: 0 };
    if (offset > size) return { lines: [], newOffset: size };   // 轮转过
    let fd = null;
    try {
        fd = fs.openSync(p, 'r');
        const len = size - offset;
        const buf = Buffer.allocUnsafe(len);
        const n = fs.readSync(fd, buf, 0, len, offset);
        const text = buf.slice(0, n).toString('utf8');
        return { lines: text.split('\n').filter(l => l.trim() !== ''), newOffset: size };
    } catch (_) {
        return { lines: [], newOffset: offset };
    } finally {
        if (fd !== null) try { fs.closeSync(fd); } catch (_) { }
    }
}

function today() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function hhmm() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 脱敏：绝不把密码/token 推进 QQ */
function sanitize(s) {
    return String(s)
        .replace(/(NAPCAT_QUICK_PASSWORD\s*[=:]\s*)\S+/gi, '$1***')
        .replace(/("?(?:token|password|secret|passwd)"?\s*[:=]\s*"?)[^\s",}]{4,}/gi, '$1***')
        .replace(/(Bearer\s+)[A-Za-z0-9._-]{8,}/gi, '$1***');
}

function trunc(s, n) { return s.length <= n ? s : s.slice(0, n - 1) + '…'; }

// ───────────────────────── OneBot 发送 ─────────────────────────

function oneBotSend(env, text) {
    return new Promise(resolve => {
        const base = (env.ONEBOT_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
        let url;
        try { url = new URL(base + '/send_private_msg'); } catch (_) { return resolve({ ok: false, err: 'URL 无效' }); }
        const payload = JSON.stringify({
            user_id: Number(env.QQ_TARGET),
            message: [{ type: 'text', data: { text: text } }],
            auto_escape: false,
        });
        const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) };
        if (env.ONEBOT_TOKEN) headers['Authorization'] = 'Bearer ' + env.ONEBOT_TOKEN;
        const req = http.request({
            hostname: url.hostname, port: url.port || 80, path: url.pathname, method: 'POST',
            headers: headers, timeout: 15000,
        }, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                const ok = /"status"\s*:\s*"ok"/.test(body) || /"retcode"\s*:\s*0/.test(body);
                resolve({ ok, status: res.statusCode, body: body.slice(0, 200) });
            });
        });
        req.on('timeout', () => { req.destroy(); resolve({ ok: false, err: '超时' }); });
        req.on('error', e => resolve({ ok: false, err: e.message }));
        req.write(payload);
        req.end();
    });
}

// ───────────────────────── 采集：异常 ─────────────────────────

function collectFatal(state) {
    const key = 'fatal';
    const f = path.join(LOG_DIR, `fatal_${today()}.log`);
    const off = state.offsets[key] || 0;
    if (!state.initialized) { state.offsets[key] = fileSize(f); return []; }
    const { lines, newOffset } = readNewLines(f, off);
    if (!lines.length) { state.offsets[key] = newOffset; return []; }
    state.offsets[key] = newOffset;
    // fatal 日志每条异常可能多行；取含 [FATAL] 的行作为标题
    const msgs = [];
    const important = lines.filter(l => /\[FATAL\]|未捕获|uncaught/i.test(l));
    if (important.length) {
        const items = important.map(l => '  • ' + trunc(sanitize(l.replace(/^.*?\[FATAL\]\s*/, '')), 200));
        msgs.push(`【严重异常】游戏进程抛出了 ${important.length} 个未捕获异常\n` +
            items.slice(0, MAX_LINES_PER_MESSAGE).join('\n') +
            `\n\n（这通常意味着有玩家操作触发了崩溃，进程已重启）`);
    } else {
        msgs.push(`【异常日志】fatal_${today()}.log 新增 ${lines.length} 行\n` +
            lines.slice(-MAX_LINES_PER_MESSAGE).map(l => '  ' + trunc(sanitize(l), 180)).join('\n'));
    }
    return msgs;
}

function collectPm2Errors(state) {
    // 合并成一条：以前每个日志文件各发一条，一次小波动就是好几条消息
    const parts = [];
    const meta = [];
    for (const [key, file, label] of [
        ['errGame', 'pm2-game-error.log', '正式服'],
        ['errTest', 'pm2-game-test-error.log', '测试服'],
        ['errWeb', 'pm2-web-error.log', 'Web 服务'],
    ]) {
        const f = path.join(LOG_DIR, file);
        const off = state.offsets[key] || 0;
        if (!state.initialized) { state.offsets[key] = fileSize(f); continue; }
        const { lines, newOffset } = readNewLines(f, off);
        if (!lines.length) { state.offsets[key] = newOffset; continue; }
        state.offsets[key] = newOffset;
        parts.push(`▎${label}（${lines.length} 行）\n` +
            lines.slice(-8).map(l => '  ' + trunc(sanitize(l), 170)).join('\n'));
        meta.push(label + ' ' + lines.length + ' 行');
    }
    if (!parts.length) return [];
    let body = parts.join('\n');
    if (body.length > 1600) body = body.slice(0, 1600) + '\n  …（内容过长已截断，完整内容见服务器日志）';
    return [`【服务错误汇总】${meta.join(' / ')}\n${body}`];
}

/** pm2 重启次数增长 = 进程崩过（最可靠的"出事了"信号） */
function collectRestarts(state) {
    let raw;
    try {
        raw = execFileSync('sudo', ['-u', 'mud', 'env', 'PM2_HOME=/home/mud/.pm2', 'pm2', 'jlist'], { timeout: 20000 }).toString();
    } catch (_) {
        try { raw = execFileSync('pm2', ['jlist'], { timeout: 20000 }).toString(); } catch (_) { return []; }
    }
    let list;
    try { list = JSON.parse(raw); } catch (_) { return []; }
    // 合并成一条：以前每个进程各发一条，一次 pm2 reload 就会连发 3 条
    const hits = [];
    let worst = 0;
    for (const p of list) {
        const name = p.name, r = p.pm2_env && p.pm2_env.restart_time;
        if (typeof r !== 'number') continue;
        const prev = state.restarts[name];
        state.restarts[name] = r;
        if (!state.initialized || prev === undefined) continue;
        const delta = r - prev;
        if (delta > 0) {
            hits.push(`  ${name}: +${delta}（累计 ${r}）`);
            if (delta > worst) worst = delta;
        }
    }
    if (!hits.length) return [];
    return [`【进程重启】${hits.length} 个服务发生重启\n${hits.join('\n')}` +
        (worst >= 3 ? '\n  ⚠ 有服务短时间多次重启，可能是崩溃循环，建议查看 fatal 日志' : '')];
}

// ───────────────────────── 采集：部署 ─────────────────────────

/** 判断三服是否健康（用于区分"拒绝部署"与"真的出事了"） */
function servicesHealthy() {
    try {
        const { execFileSync } = require("child_process");
        for (const port of [31303, 31304, 8088]) {
            const out = execFileSync("curl", ["-s", "-m", "5", `http://127.0.0.1:${port}/health`], { timeout: 8000 }).toString();
            if (!/\"ok\"/.test(out)) return false;
        }
        return true;
    } catch (_) { return false; }
}

function collectDeploy(state) {
    const msgs = [];
    const logFile = path.join(LOG_DIR, "deploy.log");

    // ---- ① 部署失败：独立追踪失败行，连续 3 次才告警 ----
    // 不能靠 deployed_ref 判断失败 —— 部署被拒绝时它根本不变（原实现的漏报原因）。
    if (!state.deployFailOffset) state.deployFailOffset = 0;
    if (!state.initialized) {
        state.deployFailOffset = fileSize(logFile);
        state.deployFailStreak = 0;
    } else {
        const { lines: newLines, newOffset } = readNewLines(logFile, state.deployFailOffset);
        state.deployFailOffset = newOffset;
        const fails = newLines.filter(l => /failed|refused|Deployment failed/i.test(l));
        const oks = newLines.filter(l => /Verified release/i.test(l));
        if (oks.length) state.deployFailStreak = 0;                 // 成功一次即清零
        if (fails.length) {
            // 只统计**新**失败行：以前每轮都会把"最后一行失败"重新读进来计数，
            // 于是同一行被反复累加（实测涨到 2525）。用内容标记去重。
            const lastLine = fails[fails.length - 1];
            if (state.deployLastFailLine !== lastLine) {
                state.deployLastFailLine = lastLine;
                state.deployFailStreak = (state.deployFailStreak || 0) + fails.length;
            }
            // 连续 3 次才告警：单次拒绝通常是提交过程中工作区短暂变脏，属瞬时状态
            if (state.deployFailStreak >= 3) {
                const healthy = servicesHealthy();
                const why = fails[fails.length - 1].replace(/^\[[^\]]+\]\s*/, "").slice(0, 160);
                msgs.push(
                    (healthy ? "【部署受阻】代码尚未更新" : "【部署失败】且服务异常") +
                    `（已连续 ${state.deployFailStreak} 次）\n` +
                    `  原因: ${why}\n` +
                    (healthy
                        ? "  ℹ 三服健康检查正常，游戏未受影响 —— 只是新代码没上去。\n    常见原因：提交过程中工作区变脏、或在非 main 分支。\n    若持续超过 15 分钟再看，通常是提交还没结束。"
                        : "  ⚠ 健康检查也不通过，这可能真的出事了，请尽快查看 log/deploy.log")
                );
                state.deployFailStreak = 0;      // 告警后清零，避免每分钟重复轰炸
            }
        }
    }

    // ---- ② 部署成功：按 deployed_ref 变化通知 ----
    const f = path.join(LOG_DIR, "deployed_ref");
    let ref = "";
    try { ref = fs.readFileSync(f, "utf8").trim(); } catch (_) { }
    if (ref && state.deployRef !== ref) {
        const isFirst = !state.deployRef;
        state.deployRef = ref;
        if (!isFirst && state.initialized) {
            msgs.push(`【部署完成】新版本 ${ref.slice(0, 7)}\n  ✓ 三服已切到新版本，健康检查通过`);
        }
    }

    return msgs;
}

// ───────────────────────── 采集：日报 ─────────────────────────

function collectDigest(state) {
    // 每 6 小时一次（00/06/12/18 点后的第一轮）
    const h = new Date().getHours();
    const slot = `${today()}-${String(Math.floor(h / 6) * 6).padStart(2, '0')}`;
    if (state.lastDigest === slot) return [];
    state.lastDigest = slot;
    if (!state.initialized) return [];

    const lines = [`【运行日报】${today()} ${hhmm()}`];

    // 版本
    try {
        const ref = fs.readFileSync(path.join(LOG_DIR, 'deployed_ref'), 'utf8').trim();
        lines.push(`版本: ${ref.slice(0, 7)}`);
    } catch (_) { }

    // 服务健康
    for (const [port, label] of [['31303', '正式服'], ['31304', '测试服'], ['8088', 'Web']]) {
        try {
            const out = execFileSync('curl', ['-s', '-m', '5', `http://127.0.0.1:${port}/health`], { timeout: 8000 }).toString();
            const ok = /"ok"/.test(out);
            lines.push(`${label}: ${ok ? '✓ 正常' : '✗ 异常'}`);
        } catch (_) { lines.push(`${label}: ✗ 无响应`); }
    }

    // 今日异常数
    try {
        const f = path.join(LOG_DIR, `fatal_${today()}.log`);
        const n = fileSize(f) > 0 ? fs.readFileSync(f, 'utf8').split('\n').filter(l => /\[FATAL\]/.test(l)).length : 0;
        lines.push(`今日严重异常: ${n} 条`);
    } catch (_) { }

    // 系统资源
    try {
        const mem = execFileSync('free', ['-m'], { timeout: 5000 }).toString().split('\n')[1].split(/\s+/);
        lines.push(`内存: 可用 ${mem[6]} MB / 共 ${mem[1]} MB`);
    } catch (_) { }
    try {
        const df = execFileSync('df', ['-h', '/'], { timeout: 5000 }).toString().split('\n')[1].split(/\s+/);
        lines.push(`磁盘: 可用 ${df[3]} / 共 ${df[1]}（已用 ${df[4]}）`);
    } catch (_) { }

    // 账号/角色数（只读查询，失败不影响）
    try {
        const n = execFileSync('sqlite3', [path.join(MUD, 'data/database.db'),
            'SELECT (SELECT COUNT(*) FROM users)||" 账号 / "||(SELECT COUNT(*) FROM players)||" 角色";'],
            { timeout: 8000 }).toString().trim();
        if (n) lines.push(`数据: ${n}`);
    } catch (_) { }

    lines.push('（本消息每 6 小时一条）');
    return [lines.join('\n')];
}

// ───────────────────────── 主流程 ─────────────────────────

async function main() {
    ensureDirs();
    const env = loadEnvFile(ENV_FILE);
    if (!env.QQ_TARGET) {
        process.stderr.write('QQ_TARGET 未配置\n');
        return 0;
    }
    const state = loadState();
    const firstRun = !state.initialized;

    // 每项带类别，供分类配额使用
    const messages = [];
    const add = (arr, kind) => { for (const t of (arr || [])) messages.push({ kind, text: t }); };
    try { add(collectFatal(state), 'fatal'); } catch (e) { process.stderr.write('fatal: ' + e.message + '\n'); }
    try { add(collectPm2Errors(state), 'service'); } catch (e) { process.stderr.write('pm2: ' + e.message + '\n'); }
    try { add(collectRestarts(state), 'service'); } catch (e) { process.stderr.write('restart: ' + e.message + '\n'); }
    try { add(collectDeploy(state), 'info'); } catch (e) { process.stderr.write('deploy: ' + e.message + '\n'); }
    try { add(collectDigest(state), 'info'); } catch (e) { process.stderr.write('digest: ' + e.message + '\n'); }

    if (firstRun) {
        // 首次运行不推送历史积压，只发一条"已上线"确认，并把所有偏移量固定到当前末尾
        state.initialized = true;
        saveState(state);
        const hello = `【监控已上线】\n服务器日志推送已开始工作。\n` +
            `以后你会收到：\n  ① 严重异常（未捕获异常/崩溃）\n  ② 进程重启\n  ③ 部署结果\n  ④ 每 6 小时一条运行日报\n` +
            `时间: ${today()} ${hhmm()}`;
        const r = await oneBotSend(env, hello);
        process.stderr.write(r.ok ? '已发送上线通知\n' : `上线通知发送失败: ${r.err || r.status}\n`);
        return r.ok ? 0 : 0;
    }

    saveState(state);

    // 分类配额（messages 里每项是 {kind, text}）
    const day = today();
    if (!state.sendDays) state.sendDays = {};
    if (!state.sendDays[day]) state.sendDays[day] = { fatal: 0, service: 0, info: 0 };
    const used = state.sendDays[day];
    if (typeof used === 'number') { state.sendDays[day] = { fatal: 0, service: 0, info: 0 }; }

    let sent = 0, failed = 0, skipped = 0;
    for (const item of messages.slice(0, BACKLOG_MAX)) {
        const kind = item.kind || 'info';
        const cap = QUOTA[kind];
        const cur = state.sendDays[day][kind] || 0;
        if (cur >= cap) { skipped++; continue; }
        const m = item.text;
        const text = trunc(m, MAX_MESSAGE_CHARS);
        const r = await oneBotSend(env, text);
        if (r.ok) {
            sent++;
            state.sendDays[day][kind] = (state.sendDays[day][kind] || 0) + 1;
            if (state.quotaNotified) delete state.quotaNotified[kind];
        } else {
            failed++;
            process.stderr.write(`发送失败: ${r.err || r.status} ${r.body || ''}\n`);
        }
        await new Promise(res => setTimeout(res, 800));   // 频率保护
    }
    // 超配额时不静默丢弃：明确记日志，并告知一次（否则"没收到告警"会被误判为"没事"）
    if (skipped) {
        state.quotaNotified = state.quotaNotified || {};
        for (const item of messages.slice(0, BACKLOG_MAX)) {
            const kind = item.kind || 'info';
            if ((state.sendDays[day][kind] || 0) >= QUOTA[kind] && !state.quotaNotified[kind]) {
                state.quotaNotified[kind] = 1;
                const names = { fatal: '严重异常', service: '服务错误/重启', info: '部署/日报' };
                await oneBotSend(env, `【配额提示】「${names[kind] || kind}」类消息今日已达上限 ${QUOTA[kind]} 条，
本类后续消息今日不再推送（其它类别不受影响）。
明天自动恢复。`);
                break;
            }
        }
    }
    const totals = state.sendDays[day];
    if (sent || failed) process.stderr.write(`推送完成：成功 ${sent}，失败 ${failed}，配额跳过 ${skipped}（今日 fatal ${totals.fatal} / service ${totals.service} / info ${totals.info}）\n`);
    saveState(state);
    return 0;
}

main().then(code => process.exit(code)).catch(e => {
    process.stderr.write('qq_report 异常: ' + (e && e.stack || e) + '\n');
    process.exit(0);   // 绝不让监控脚本本身影响 cron
});
