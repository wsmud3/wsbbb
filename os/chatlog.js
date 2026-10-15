/**
 * 聊天记录持久化（os/chatlog.js）
 *
 * 为什么需要它：项目里原本有一条日志通道（`WORLD.log()` → `db.saveLogs()` →
 * `data/log/log<日期>.txt`），但实测 `data/log/` 是空的 —— 聊天流程从未调用它
 * （`world/cmd/channel/chat.js` 里那行调用是被注释掉的），所以"查某个时间段的
 * 聊天记录"在改造前根本做不到。
 *
 * 本模块做一件很小的事：把各频道发言追加到按天切分的文本文件里，并提供按
 * 时间段/频道/关键词查询的能力，供运维机器人读取。
 *
 * 设计原则：
 *   1. **绝不影响聊天**：所有写入与查询都包在 try/catch 里，任何异常只记 console，
 *      不抛给调用方（玩家发言不会因为日志失败而丢失）
 *   2. **异步写入**：用 fs.appendFile（不阻塞事件循环），游戏是单线程的，
 *      同步写会在高并发发言时造成卡顿
 *   3. **自动清理**：只保留 CHATLOG_KEEP_DAYS 天，避免日志无限增长
 *   4. **格式稳定可排序**：`[YYYY-MM-DD HH:MM:SS] <频道> <发言者>: <内容>`
 *      时间用固定宽度格式，因此可以直接用字符串比较做范围筛选
 *
 * 注意时区：服务器是 UTC，行内时间也是 UTC。查询接口会同时标注北京时间。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const KEEP_DAYS = 30;

function logDir() {
    // __PATH.DATA 指向 data/，与其它日志保持一致
    try { return path.join(__PATH.DATA, 'chatlog'); } catch (_) { return path.join(process.cwd(), 'data', 'chatlog'); }
}

function pad(n) { return String(n).padStart(2, '0'); }

/** `YYYY-MM-DD`（UTC） */
function dayKey(d) {
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** `YYYY-MM-DD HH:MM:SS`（UTC，定宽可排序） */
function stamp(d) {
    return `${dayKey(d)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

const CHANNEL_NAMES = {
    chat: '世界', es: '全区', pty: '帮派', fam: '门派',
    tell: '私聊', tm: '队伍', say: '房间',
};

let dirReady = false;
let lastCleanup = '';

function ensureDir() {
    if (dirReady) return true;
    try { fs.mkdirSync(logDir(), { recursive: true }); dirReady = true; return true; }
    catch (e) { console.error('[chatlog] 创建目录失败:', e.message); return false; }
}

/** 每天最多清理一次 */
function cleanupOld() {
    const today = dayKey(new Date());
    if (lastCleanup === today) return;
    lastCleanup = today;
    try {
        const cutoff = new Date(Date.now() - KEEP_DAYS * 86400000);
        const cutKey = dayKey(cutoff).replace(/-/g, '');   // 与文件名一致：YYYYMMDD
        for (const f of fs.readdirSync(logDir())) {
            const m = /^chat-(\d{8})\.log$/.exec(f);
            if (m && m[1] < cutKey) {
                fs.unlink(path.join(logDir(), f), () => { });
            }
        }
    } catch (_) { }
}

/**
 * 记录一条发言。
 * @param {string} channel 频道标识（chat/es/pty/fam/tell/tm/say…）
 * @param {object} speaker 发言者（取 name / id）
 * @param {string} content 纯文本内容（调用方保证已去掉 HTML 标签）
 * @param {object} [extra] { school, server, to } 可选附加信息
 */
function record(channel, speaker, content, extra) {
    try {
        if (!ensureDir()) return;
        cleanupOld();
        const now = new Date();
        const name = (speaker && (speaker.name || speaker.id)) || '?';
        let text = String(content == null ? '' : content).replace(/[\r\n]+/g, ' ').trim();
        if (!text) return;
        if (text.length > 500) text = text.slice(0, 500) + '…';

        let line = `[${stamp(now)}] ${channel} ${name}: ${text}`;
        if (extra) {
            const tags = [];
            if (extra.to) tags.push('→' + extra.to);
            if (extra.server) tags.push('@' + extra.server);
            if (extra.school) tags.push('#' + extra.school);
            if (tags.length) line += ' (' + tags.join(' ') + ')';
        }
        const file = path.join(logDir(), `chat-${dayKey(now).replace(/-/g, '')}.log`);
        fs.appendFile(file, line + '\n', () => { });
    } catch (e) {
        console.error('[chatlog] 记录失败:', e.message);
    }
}

/** 把 `YYYY-MM-DD HH:MM` / `HH:MM` / `YYYY-MM-DD` 解析成 UTC 定宽戳 */
function parseTime(s, isEnd) {
    if (!s) return null;
    s = String(s).trim();
    let m;
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s))) {
        return `${m[1]}-${pad(+m[2])}-${pad(+m[3])} ${pad(+m[4])}:${m[5]}:${m[6] || '00'}`;
    }
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s))) {
        return `${m[1]}-${pad(+m[2])}-${pad(+m[3])} ${isEnd ? '23:59:59' : '00:00:00'}`;
    }
    if ((m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s))) {
        // 只给时分：默认今天（UTC）
        const d = dayKey(new Date());
        return `${d} ${pad(+m[1])}:${m[2]}:${m[3] || '00'}`;
    }
    return null;
}

/** 列出可用的日志文件（按日期升序） */
function files() {
    try {
        return fs.readdirSync(logDir())
            .filter(f => /^chat-\d{8}\.log$/.test(f))
            .sort()
            .map(f => path.join(logDir(), f));
    } catch (_) { return []; }
}

/**
 * 查询聊天记录。
 * @param {object} opt { from, to, channel, who, keyword, limit }
 *   from/to 支持 `YYYY-MM-DD HH:MM`、`YYYY-MM-DD`、`HH:MM`
 * @returns {{ lines: string[], total: number, truncated: boolean, files: number }}
 */
function query(opt) {
    opt = opt || {};
    const limit = Math.max(1, Math.min(200, parseInt(opt.limit, 10) || 50));
    const from = parseTime(opt.from, false);
    const to = parseTime(opt.to, true);
    const ch = opt.channel ? String(opt.channel).trim().toLowerCase() : '';
    const who = opt.who ? String(opt.who).trim() : '';
    const kw = opt.keyword ? String(opt.keyword).trim() : '';

    const out = [];
    let total = 0;
    const fs_ = files().slice(-KEEP_DAYS);
    for (const f of fs_) {
        let text;
        try { text = fs.readFileSync(f, 'utf8'); } catch (_) { continue; }
        for (const raw of text.split('\n')) {
            if (!raw) continue;
            // [YYYY-MM-DD HH:MM:SS] ch name: content
            const m = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\S+) (.*)$/.exec(raw);
            if (!m) continue;
            const t = m[1];
            if (from && t < from) continue;
            if (to && t > to) continue;
            if (ch && m[2].toLowerCase() !== ch) continue;
            const rest = m[3];
            if (who && rest.indexOf(who + ':') !== 0) continue;
            if (kw && rest.indexOf(kw) < 0) continue;
            total++;
            out.push(raw);
        }
    }
    return { lines: out.slice(-limit), total, truncated: total > out.slice(-limit).length, files: fs_.length };
}

/** 各频道发言量统计（供"最近谁在聊"之类的概览） */
function stats(days) {
    const n = Math.max(1, Math.min(KEEP_DAYS, parseInt(days, 10) || 1));
    const byCh = {};
    const byWho = {};
    let total = 0;
    for (const f of files().slice(-n)) {
        let text;
        try { text = fs.readFileSync(f, 'utf8'); } catch (_) { continue; }
        for (const raw of text.split('\n')) {
            const m = /^\[[^\]]+\] (\S+) ([^:]+):/.exec(raw);
            if (!m) continue;
            total++;
            byCh[m[1]] = (byCh[m[1]] || 0) + 1;
            const who = m[2].trim();
            byWho[who] = (byWho[who] || 0) + 1;
        }
    }
    return { total, byCh, byWho, days: n, files: files().length };
}

module.exports = { record, query, stats, parseTime, CHANNEL_NAMES, KEEP_DAYS, logDir };
