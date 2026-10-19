#!/usr/bin/env node
/**
 * QQ 机器人健康看护 + 自助恢复
 *
 * 存在的理由：
 *   推送脚本依赖机器人本身（要经 OneBot 发消息）。机器人一掉线，它就只会
 *   **静默失败**。实测：小号被腾讯踢下线后 18 小时里一条消息都发不出去，
 *   用户毫不知情。监控系统最不该有的缺陷就是「自己失效时无法报告」。
 *
 * 本脚本做四件事，全部**不依赖机器人**：
 *   ① 每分钟检查 OneBot 服务 + QQ 账号在线状态
 *   ② 状态转变写入独立日志（服务器上直接可查）
 *   ③ **掉线时发邮件，并内嵌登录二维码** —— 用户直接在邮件里扫码即可让
 *      机器人重新上线。二维码会随邮件重新生成（约 2 分钟有效），
 *      所以每封提醒邮件都附一张**新鲜**的码。
 *   ④ 未扫码则按 5/15/30/60 分钟递进提醒；恢复后发确认邮件并补发积压告警
 *
 * 由 root crontab 每分钟调用。
 */
'use strict';
const fs = require('fs');
const http = require('http');
const { execFile } = require('child_process');

const ENV_FILE = '/etc/napcat/onebot.env';
const STATE_DIR = '/var/lib/mud-qqbot';
const STATE = STATE_DIR + '/watchdog.json';
const LOG = '/var/log/mud-qqbot-watchdog.log';
const DOWN_LOG = '/home/mud/mud/log/qqbot-down.log';
const QR_PNG = '/root/Napcat/opt/QQ/resources/app/app_launcher/napcat/cache/qrcode.png';
const QR_HELPER = '/usr/local/bin/napcat-qr';

// 提醒节奏，分两段：
//   第一阶段（前 3 小时）：密集提醒，因为大概率用户就在附近，扫一下就好
//   第二阶段（超过 3 小时）：**每 6 小时一次，永不停止**
//
// 为什么要第二阶段：最初的设计是"提醒 6 次后放弃"，结果 10-16 那次机器人
// 离线了 2.6 天，6 封邮件在周五晚上 3 小时内发完，之后 59 小时完全静默 ——
// 用户在周末使用机器人时才发现它坏了。把"避免刷屏"排在"别让用户不知道"
// 前面是错的：监控失效时沉默，等于监控不存在。
const REMIND_AT_MIN = [0, 5, 15, 30, 60, 180];
const MAX_REMINDERS = REMIND_AT_MIN.length;   // 密集阶段次数（仅用于邮件里显示进度）
const PERSIST_EVERY_SEC = 6 * 3600;          // 长期阶段：每 6 小时一次

let notify = null;
try { notify = require('/home/mud/bin/notify.js'); } catch (e) { console.error('notify 加载失败', e.message); }

function loadEnv() {
    const o = {};
    try {
        for (const l of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
            const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(l);
            if (m) o[m[1]] = m[2].trim();
        }
    } catch (_) { }
    return o;
}
function log(msg) {
    try {
        if (fs.existsSync(LOG) && fs.statSync(LOG).size > 2 * 1024 * 1024) fs.writeFileSync(LOG, '');
        fs.appendFileSync(LOG, `[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] ${msg}\n`);
    } catch (_) { }
}
function loadState() { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')) || {}; } catch (_) { return {}; } }
function saveState(s) { try { fs.writeFileSync(STATE, JSON.stringify(s, null, 2)); } catch (_) { } }
function nowSec() { return Math.floor(Date.now() / 1000); }
function utc() { return new Date().toISOString().replace('T', ' ').slice(0, 19); }
function bj() {
    const d = new Date(Date.now() + 8 * 3600000);
    const p = n => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}
function human(sec) {
    sec = Math.max(0, sec | 0);
    const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60);
    if (d) return `${d} 天 ${h} 小时`;
    if (h) return `${h} 小时 ${m} 分`;
    return `${m} 分 ${sec % 60} 秒`;
}

function oneBotCall(env, path, body) {
    return new Promise(res => {
        const base = (env.ONEBOT_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
        let url; try { url = new URL(base + path); } catch (_) { return res(''); }
        const payload = JSON.stringify(body || {});
        const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) };
        if (env.ONEBOT_TOKEN) headers['Authorization'] = 'Bearer ' + env.ONEBOT_TOKEN;
        const req = http.request({ hostname: url.hostname, port: url.port || 80, path: url.pathname, method: 'POST', headers, timeout: 8000 },
            r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res(b)); });
        req.on('timeout', () => { req.destroy(); res(''); });
        req.on('error', () => res(''));
        req.write(payload); req.end();
    });
}

function run(cmd, args, timeout) {
    return new Promise(res => {
        execFile(cmd, args, { timeout: timeout || 120000, maxBuffer: 8 * 1024 * 1024 },
            (err, stdout) => res(err ? '' : String(stdout)));
    });
}

/**
 * 生成一张**新鲜**的登录二维码。
 * 关键点：NapCat 会缓存二维码，直接读文件往往拿到过期的图；
 * 必须先用 WebUI 的 RefreshQRcode 接口强制重新生成，再取文件。
 */
async function freshQRCode() {
    // ① 强制刷新（经 root 助手，它内部会登 WebUI 并调 RefreshQRcode）
    const out = (await run('sudo', ['-n', QR_HELPER], 180000)).trim();
    // 助手在"已登录"时直接返回 LOGGED —— 这个信息本身有用（说明无需扫码）
    if (out === 'LOGGED') return 'LOGGED';
    let png = null, verify = '';
    try {
        const j = JSON.parse(out);
        if (j && j.png) png = Buffer.from(j.png, 'base64');
        if (j && j.verify) verify = j.verify;      // 腾讯的"新设备验证"链接（若有）
    } catch (_) { }
    // 助手没给图才退化到读文件。注意：缓存文件可能是过期的，
    // 所以只作为最后兜底，并且要求文件较新（10 分钟内）。
    if (!png) {
        try {
            const stt = fs.statSync(QR_PNG);
            if (Date.now() - stt.mtimeMs < 10 * 60000) png = fs.readFileSync(QR_PNG);
        } catch (_) { }
    }
    if (!png || png.length < 200) return null;
    // ③ 顺带把解码链接取出来当兜底（二维码图片在部分客户端会被压缩到扫不出）
    let link = '';
    try {
        const raw = fs.readFileSync('/var/log/napcat.log', 'utf8');
        const ms = raw.match(/https:\/\/txz\.qq\.com\/p\?k=[^\s]+/g);
        if (ms && ms.length) link = ms[ms.length - 1];
    } catch (_) { }
    return { png, link, verify };
}

/** 组装二维码提醒邮件（内嵌图片，用户直接在邮件里扫） */
function buildQrMail(qr, downFor, attempt, why) {
    const cid = 'qr' + Date.now();
    const first = attempt === 1;
    // 标题要能一眼看出严重程度：离线超过 1 天的用红字标题风格
    const days = downFor / 86400;
    const subject = first
        ? 'QQ 机器人已离线 —— 请扫码恢复（邮件内可直接扫）'
        : (downFor >= 86400
            ? `⚠ 机器人已离线 ${Math.floor(days)} 天 ${Math.floor((downFor % 86400) / 3600)} 小时（第 ${attempt} 次提醒）`
            : `QQ 机器人仍未恢复（第 ${attempt} 次提醒，已离线 ${human(downFor)}）—— 请扫码`);

    const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#222;line-height:1.6">
<h2 style="margin:0 0 8px;color:#c0392b">${first ? 'QQ 机器人已离线' : '机器人仍未恢复'}</h2>
<p style="margin:0 0 16px;color:#666">检测时间：${bj()}（北京时间）　离线时长：<b>${human(downFor)}</b>${first ? '' : `　提醒次数：${attempt}/${MAX_REMINDERS}`}</p>

<table style="border-collapse:collapse;margin:0 0 18px"><tr>
<td style="padding:4px 12px 4px 0;color:#666">原因</td><td style="padding:4px 0"><b>${why}</b></td>
</tr><tr>
<td style="padding:4px 12px 4px 0;color:#666">机器人在线</td><td style="padding:4px 0">否</td>
</tr></table>

<div style="border:2px solid #2c7be5;border-radius:10px;padding:18px;display:inline-block;background:#f7faff">
  <div style="font-weight:600;margin-bottom:10px;color:#2c7be5">用手机 QQ 扫码即可恢复（请登录 1228511312）</div>
  <img src="cid:${cid}" alt="登录二维码" style="width:220px;height:220px;display:block;image-rendering:pixelated">
  <div style="font-size:12px;color:#888;margin-top:8px">二维码约 2 分钟有效 —— 扫不动就等下一封提醒邮件（会附新码）</div>
</div>

<p style="margin:18px 0 6px;font-size:13px;color:#666">扫码后请在手机上点「确认登录」，机器人会自动恢复，届时你会收到一封恢复通知。</p>
${qr.verify ? `<div style="border:1px solid #e0a800;background:#fffbea;border-radius:8px;padding:14px;margin:16px 0">
  <div style="font-weight:600;color:#8a6d00;margin-bottom:6px">另一条路：完成腾讯的「新设备验证」（可能让登录更持久）</div>
  <div style="font-size:13px;color:#555;line-height:1.6">
    这次被踢的原因很可能是腾讯只给了<b>短期凭据</b>（实测约 1.5~2 小时就作废）。<br>
    腾讯在下发这个链接时，就是在要求完成新设备验证。若走完它，登录态<b>可能变成长期有效</b>，就不用每两小时扫一次码。<br>
    <span style="color:#a00">注意：此链接有时效，且其中的图片验证码我无法替你识别 —— 需要你本人操作。</span>
  </div>
  <div style="margin-top:8px;font-size:12px;word-break:break-all"><a href="${qr.verify}">${qr.verify.slice(0, 110)}…</a></div>
</div>` : ''}
${qr.link ? `<p style="margin:6px 0;font-size:12px;color:#888">若图片被客户端压缩导致扫不出，可在<b>手机 QQ 内</b>打开此链接完成同样授权：<br><span style="word-break:break-all">${qr.link}</span></p>` : ''}
<hr style="border:none;border-top:1px solid #eee;margin:18px 0">
<p style="font-size:12px;color:#999;margin:0">本邮件由服务器上的独立看护进程发出，不依赖 QQ 通道 —— 因此机器人掉线时它仍然可用。<br>
提醒节奏：离线后 ${REMIND_AT_MIN.join(' / ')} 分钟各一次，之后<b>每 ${PERSIST_EVERY_SEC/3600} 小时一次，直到你处理为止（不会停止）</b>。恢复后自动通知。</p>
</body></html>`;

    const text = [
        first ? 'QQ 机器人已离线' : `机器人仍未恢复（第 ${attempt} 次提醒）`,
        '',
        `检测时间: ${bj()}（北京时间）`,
        `离线时长: ${human(downFor)}`,
        `原因: ${why}`,
        '',
        '请打开本邮件的 HTML 版本，用手机 QQ 扫其中的二维码恢复（登录 1228511312）。',
        qr.link ? `备用链接（在手机 QQ 内打开）: ${qr.link}` : '',
        '',
        `二维码约 2 分钟有效；提醒节奏 ${REMIND_AT_MIN.join('/')} 分钟。`,
    ].filter(Boolean).join('\n');

    return { subject, text, html, images: [{ cid, data: qr.png, filename: 'qq-login-qr.png' }] };
}

// 看护脚本自身的异常必须留痕 —— 否则"监控坏了"这件事本身没人知道，
// 而这正是我们要解决的问题（10-16 那次就是脚本抛错后静默退出）。
process.on('uncaughtException', e => {
    log('✗✗ 看护脚本未捕获异常: ' + ((e && e.stack) || e));
    process.exit(1);
});
process.on('unhandledRejection', e => {
    log('✗✗ 看护脚本未处理 Promise 拒绝: ' + ((e && e.stack) || e));
});

// 单实例锁：cron 每分钟触发，而一次运行可能耗时数十秒（取二维码、发邮件、重启服务），
// 并发运行会导致重复发信（实测发生过同一分钟发了两封一模一样的邮件）。
const LOCK = STATE_DIR + '/.watchdog.lock';
function acquireLock() {
    try {
        fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
    } catch (_) { }
    try {
        const st = fs.statSync(LOCK);
        // 超过 10 分钟的锁视为残留（进程被杀等），强制回收
        if (Date.now() - st.mtimeMs > 10 * 60000) { try { fs.unlinkSync(LOCK); } catch (_) { } }
    } catch (_) { }
    try {
        const fd = fs.openSync(LOCK, 'wx');       // O_EXCL：已存在则失败
        fs.writeSync(fd, String(process.pid));
        fs.closeSync(fd);
        return true;
    } catch (_) {
        return false;                              // 已有实例在跑
    }
}
if (!acquireLock()) {
    // 另一个实例正在运行，本次直接退出（不写日志，避免每分钟刷一行）
    process.exit(0);
}
function releaseLock() { try { fs.unlinkSync(LOCK); } catch (_) { } }
process.on('exit', releaseLock);

(async () => {
    try { fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 }); } catch (_) { }
    const env = loadEnv();
    if (!env.QQ_TARGET) { log('QQ_TARGET 未配置，跳过'); return; }

    // ---------- ① 探测 ----------
    const resp = await oneBotCall(env, '/get_status', {});
    let alive = false, why = '';
    if (/"status"\s*:\s*"ok"/.test(resp)) {
        if (/"online"\s*:\s*true/.test(resp)) alive = true;
        else why = 'OneBot 服务在，但 QQ 账号已离线（被踢下线，需重新扫码）';
    } else {
        why = 'OneBot 服务无响应（端口未监听或进程已退出）';
    }

    // ---------- ② 状态机 ----------
    const st = loadState();
    const prevAlive = typeof st.alive === 'boolean' ? st.alive : null;
    st.alive = alive;
    st.checkedAt = nowSec();

    let transition = null, downFor = 0;
    if (prevAlive === null) {
        st.downSince = alive ? null : nowSec();
        st.pending = [];
        st.remindersSent = 0;
        st.nextReminderIdx = 0;
    } else if (prevAlive && !alive) {
        transition = 'down';
        st.downSince = nowSec();
        st.pending = [];
        st.remindersSent = 0;
        st.nextReminderIdx = 0;
        st.lastReminderAt = nowSec();
        st.lastQr = null;
    } else if (!prevAlive && alive) {
        transition = 'up';
        downFor = st.downSince ? nowSec() - st.downSince : 0;
        st.lastDownFor = downFor;
        st.downSince = null;
    }

    if (!alive) {
        st.pending = st.pending || [];
        const last = st.pending[st.pending.length - 1];
        if (!last || last.why !== why) st.pending.push({ at: nowSec(), why });
        if (st.pending.length > 30) st.pending = st.pending.slice(-30);
        if (st.lastLoggedAlive !== false) {
            log('⚠ 机器人不可用：' + why);
            try { fs.appendFileSync(DOWN_LOG, `[${utc()}] [QQBOT-DOWN] ${why}\n`); } catch (_) { }
        }
        st.lastLoggedAlive = false;
    }

    // ---------- ③ 掉线：先尝试自愈，再决定是否发二维码 ----------
    if (transition === 'down') {
        log(`机器人转为不可用：${why}`);
        st.lastLoggedAlive = false;

        // 关键顺序：先尝试自愈（拉起服务 / 触发登录流程），成功了就不打扰用户。
        // 因为"进程崩了"这种情况 NapCat 一启动就能用保存的登录态自动登录，
        // 根本不需要用户扫码 —— 这时发二维码邮件是多余打扰。
        let selfHealed = false;
        try {
            const probe = await freshQRCode();
            if (probe === 'LOGGED') {
                const re = await oneBotCall(env, '/get_status', {});
                if (/"online"\s*:\s*true/.test(re)) {
                    selfHealed = true;
                    log('自愈成功：服务已恢复且账号自动登录，无需用户扫码（不发二维码邮件）');
                    saveState(Object.assign(st, { alive: true, downSince: null, pending: [], remindersSent: 0, nextReminderIdx: 0, lastLoggedAlive: true }));
                    if (notify && notify.mailReady()) {
                        const mr = await notify.send('QQ 机器人曾短暂不可用（已自愈）',
                            `检测到机器人不可用，但服务自愈后账号自动登录成功，无需你处理。\n\n` +
                            `原因: ${why}\n时间: ${bj()}（北京时间）\n\n` +
                            `说明：这种情况通常是 NapCat 进程退出，重启后它能用保存的登录态自动登录。\n` +
                            `只有"账号登录态失效（被踢下线）"才需要你扫码 —— 那时邮件会附带二维码。`,
                            { channels: ['mail'] });
                        log('自愈说明邮件 ' + (mr.mail && mr.mail.ok ? '发送成功' : '失败'));
                    }
                    return;
                }
            }
        } catch (e) { log('自愈探测异常: ' + e.message); }

        if (notify && notify.mailReady()) {
            const qr = await freshQRCode();
            if (qr) {
                const mail = buildQrMail(qr, 0, 1, why);
                const r = await notify.send(mail.subject, mail.text, {
                    channels: ['mail'], html: mail.html, images: mail.images,
                });
                log('掉线二维码邮件 ' + (r.mail && r.mail.ok ? '发送成功' : '失败(' + (r.mail && r.mail.err) + ')'));
                st.remindersSent = 1;
                st.nextReminderIdx = 1;
            } else {
                log('取二维码失败，退化为纯文本告警');
                const r = await notify.send('QQ 机器人已离线（二维码生成失败）',
                    `原因: ${why}\n时间: ${bj()}（北京时间）\n\n` +
                    `二维码生成失败（可能是 napcat-qr 助手或 NapCat 状态异常），请手动处理。`,
                    { channels: ['mail'] });
                log('掉线邮件 ' + (r.mail && r.mail.ok ? '发送成功' : '失败'));
            }
        } else {
            log('邮件通道未配置，无法在掉线时告知用户');
        }
    }

    // ---------- ④ 持续掉线：按节奏提醒（每封附新二维码）----------
    if (!alive && st.downSince) {
        const elapsedSec = nowSec() - st.downSince;
        const elapsedMin = elapsedSec / 60;
        const idx = st.nextReminderIdx || 0;

        // 判断这次要不要提醒：先走密集阶段，走完后进入"每 6 小时一次"的长期阶段
        let due = false;
        if (idx < REMIND_AT_MIN.length) {
            due = elapsedMin >= REMIND_AT_MIN[idx];
        } else {
            // 长期阶段：距上次提醒超过 6 小时就再发一封（永不放弃）
            const since = st.lastReminderAt || st.downSince;
            due = (nowSec() - since) >= PERSIST_EVERY_SEC;
        }

        if (due) {
            const attempt = (st.remindersSent || 0) + 1;
            if (notify && notify.mailReady()) {
                const qr = await freshQRCode();
                if (qr) {
                    const mail = buildQrMail(qr, nowSec() - st.downSince, attempt, why);
                    const r = await notify.send(mail.subject, mail.text, {
                        channels: ['mail'], html: mail.html, images: mail.images,
                    });
                    log(`第 ${attempt} 次提醒邮件 ` + (r.mail && r.mail.ok ? '发送成功' : '失败(' + (r.mail && r.mail.err) + ')') +
                        `（离线 ${human(nowSec() - st.downSince)}）`);
                } else {
                    log(`第 ${attempt} 次提醒：取二维码失败`);
                }
            }
            st.remindersSent = attempt;
            st.lastReminderAt = nowSec();
            if (idx < REMIND_AT_MIN.length) {
                st.nextReminderIdx = idx + 1;
                if (idx + 1 >= REMIND_AT_MIN.length) {
                    log(`密集提醒结束，转入长期提醒：每 ${PERSIST_EVERY_SEC/3600} 小时一次，直到恢复`);
                }
            }
            log(`累计提醒 ${attempt} 次（已离线 ${human(elapsedSec)}）`);
        }
    }

    // ---------- ⑤ 恢复：通知 + 补发 ----------
    if (transition === 'up') {
        const pendingCount = (st.pending || []).length;
        log(`机器人已恢复（中断 ${human(downFor)}，期间 ${pendingCount} 条事件待补发，提醒 ${st.remindersSent || 0} 次）`);
        const words = [
            '【监控已恢复】QQ 机器人重新上线。',
            `中断时长: ${human(downFor)}`,
            pendingCount ? `故障期间累积事件: ${pendingCount} 条（下方按序补发）` : '故障期间无异常事件累积',
            st.remindersSent ? `本次共发出 ${st.remindersSent} 次二维码提醒邮件。` : '',
        ].filter(Boolean).join('\n');
        const r = await oneBotCall(env, '/send_private_msg', {
            user_id: Number(env.QQ_TARGET),
            message: [{ type: 'text', data: { text: words } }],
            auto_escape: false,
        });
        const ok = /"status"\s*:\s*"ok"/.test(r);
        log('恢复通知（QQ）' + (ok ? '发送成功' : '发送失败'));
        if (notify && notify.mailReady()) {
            const mr = await notify.send('QQ 机器人已恢复',
                `机器人重新上线。\n\n中断时长: ${human(downFor)}\n` +
                `${pendingCount ? '故障期间累积事件: ' + pendingCount + ' 条（已补发）' : '故障期间无异常事件'}\n` +
                `提醒邮件: 本次共 ${st.remindersSent || 0} 次\n` +
                `恢复时间: ${bj()}（北京时间）`,
                { channels: ['mail'] });
            log('恢复邮件 ' + (mr.mail && mr.mail.ok ? '发送成功' : '失败'));
        }
        st.pending = [];
        st.remindersSent = 0;
        st.nextReminderIdx = 0;
        st.lastLoggedAlive = true;
        if (ok) execFile('/home/mud/bin/qq-push.sh', [], { timeout: 120000 }, () => { });
    }
    if (alive && st.lastLoggedAlive !== true) {
        log('机器人正常（OneBot 可用且账号在线）');
        st.lastLoggedAlive = true;
    }

    saveState(st);
})().catch(async e => {
    log('✗✗ 看护理主流程异常: ' + ((e && e.stack) || e));
    // 尽量用邮件把"监控自己坏了"这件事告诉用户 —— 这是最后一道防线
    try {
        if (notify && notify.mailReady()) {
            await notify.send('监控脚本自身出错（请检查）',
                `看护脚本执行时抛出异常，可能已无法正常监控机器人。\n\n` +
                `错误: ${(e && e.message) || e}\n` +
                `时间: ${bj()}（北京时间）\n\n` +
                `栈:
${String((e && e.stack) || '').slice(0, 800)}\n\n` +
                `建议: 查看 /var/log/mud-qqbot-watchdog.log`,
                { channels: ['mail'] });
        }
    } catch (_) { }
    process.exit(1);
});
