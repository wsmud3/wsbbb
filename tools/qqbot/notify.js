#!/usr/bin/env node
/**
 * 通知模块：QQ（OneBot）与邮件（SMTP）两条通道
 *
 * 为什么需要邮件：
 *   QQ 通道存在一个**根本性缺口** —— 机器人自己掉线时，就没有任何途径
 *   告知用户。实测发生过：小号被腾讯踢下线后 18 小时无人知晓。
 *   邮件不依赖 QQ，因此能覆盖这个缺口。
 *
 * 进阶用途：邮件不只报警，还能**附带修复手段** —— 例如内嵌登录二维码，
 *   用户直接在邮件里扫码即可让机器人重新上线（见 qqbot-watchdog.js）。
 *
 * 用法：
 *     const notify = require('/home/mud/bin/notify.js');
 *     await notify.send('标题', '正文');
 *     await notify.send('标题', '正文', { html: '<p>富文本</p>', images: [{ cid, data: Buffer }] });
 *
 * 配置：/etc/napcat/notify.env（root 600）
 *     SMTP_HOST=smtp.qq.com
 *     SMTP_PORT=587          （实测 465 从本机连不通，587 可用）
 *     SMTP_USER=...@qq.com
 *     SMTP_PASS=<授权码>
 *     MAIL_TO=...@qq.com
 */
'use strict';
const fs = require('fs');
const http = require('http');

const ENV_FILE = '/etc/napcat/notify.env';
const ONEBOT_ENV = '/etc/napcat/onebot.env';
const LOG = '/var/log/mud-notify.log';

function parseEnv(file) {
    const o = {};
    try {
        for (const l of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
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

// ─────────────────── QQ 通道（OneBot） ───────────────────
function sendQQ(text) {
    const env = parseEnv(ONEBOT_ENV);
    return new Promise(res => {
        if (!env.QQ_TARGET) return res({ ok: false, err: 'QQ_TARGET 未配置' });
        const base = (env.ONEBOT_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
        let url; try { url = new URL(base + '/send_private_msg'); } catch (_) { return res({ ok: false, err: 'URL 无效' }); }
        const payload = JSON.stringify({
            user_id: Number(env.QQ_TARGET),
            message: [{ type: 'text', data: { text: String(text).slice(0, 4000) } }],
            auto_escape: false,
        });
        const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) };
        if (env.ONEBOT_TOKEN) headers['Authorization'] = 'Bearer ' + env.ONEBOT_TOKEN;
        const req = http.request({ hostname: url.hostname, port: url.port || 80, path: url.pathname, method: 'POST', headers, timeout: 15000 },
            r => { let b = ''; r.on('data', d => b += d); r.on('end', () => res({ ok: /"status"\s*:\s*"ok"/.test(b), body: b.slice(0, 120) })); });
        req.on('timeout', () => { req.destroy(); res({ ok: false, err: '超时' }); });
        req.on('error', e => res({ ok: false, err: e.message }));
        req.write(payload); req.end();
    });
}

// ─────────────────── 邮件通道（SMTP） ───────────────────
let transporter = null, mailCfg = null;
function getTransporter() {
    const env = parseEnv(ENV_FILE);
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.MAIL_TO) return null;
    if (transporter && mailCfg &&
        mailCfg.host === env.SMTP_HOST && mailCfg.user === env.SMTP_USER && mailCfg.pass === env.SMTP_PASS) {
        return transporter;
    }
    let nodemailer;
    try { nodemailer = require('/home/mud/mud/node_modules/nodemailer'); }
    catch (_) { try { nodemailer = require('nodemailer'); } catch (e2) { log('nodemailer 不可用: ' + e2.message); return null; } }
    const port = parseInt(env.SMTP_PORT, 10) || 587;
    transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: port,
        secure: port === 465,          // 465 隐式 TLS；587 走 STARTTLS
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 25000,
    });
    mailCfg = { host: env.SMTP_HOST, user: env.SMTP_USER, pass: env.SMTP_PASS };
    return transporter;
}

/**
 * @param {string} subject
 * @param {string} text 纯文本正文
 * @param {object} [opt] { html, images: [{cid, data}] }
 */
async function sendMail(subject, text, opt) {
    opt = opt || {};
    const env = parseEnv(ENV_FILE);
    const t = getTransporter();
    if (!t) return { ok: false, err: '邮件未配置（缺 SMTP_HOST/SMTP_USER/SMTP_PASS/MAIL_TO）' };
    try {
        const mail = {
            from: `"MUD 监控" <${env.SMTP_USER}>`,
            to: env.MAIL_TO,
            subject: '[MUD] ' + subject,
            text: text,
        };
        if (opt.html) mail.html = opt.html;
        // 内嵌图片：邮件客户端会直接显示，不需要另存附件
        if (Array.isArray(opt.images) && opt.images.length) {
            mail.attachments = opt.images.map(im => ({
                filename: im.filename || (im.cid + '.png'),
                content: im.data,
                cid: im.cid,
            }));
        }
        const info = await t.sendMail(mail);
        return { ok: true, id: info.messageId };
    } catch (e) {
        return { ok: false, err: e.message };
    }
}

/**
 * 发送通知。
 * @param {string} subject 标题（QQ 通道会拼在正文首行）
 * @param {string} text 正文
 * @param {object} [opt] { channels: ['qq','mail'], html, images }
 */
async function send(subject, text, opt) {
    opt = opt || {};
    const channels = opt.channels || ['qq', 'mail'];
    const out = {};
    const body = subject ? `${subject}\n${text}` : text;
    if (channels.includes('qq')) {
        out.qq = await sendQQ(body);
        log(`QQ 通知 ${out.qq.ok ? '成功' : '失败(' + (out.qq.err || out.qq.body) + ')'}: ${subject}`);
    }
    if (channels.includes('mail')) {
        out.mail = await sendMail(subject, text, { html: opt.html, images: opt.images });
        log(`邮件通知 ${out.mail.ok ? '成功' : '失败(' + out.mail.err + ')'}: ${subject}`);
    }
    return out;
}

/** 邮件通道是否已配置好 */
function mailReady() {
    const env = parseEnv(ENV_FILE);
    return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.MAIL_TO);
}

module.exports = { send, sendQQ, sendMail, mailReady, parseEnv, log };

// 直接执行时做一次自检
if (require.main === module) {
    (async () => {
        const subj = process.argv[2] || '邮件通道自检';
        const text = process.argv[3] || `这是一条来自服务器的测试邮件。\n时间: ${new Date().toISOString()}`;
        console.log('mailReady =', mailReady());
        const r = await send(subj, text, { channels: ['mail'] });
        console.log(JSON.stringify(r, null, 2));
    })();
}
