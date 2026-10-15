// 只读审计工具（不修改任何文件）。用法：仓库根目录执行 node tools/audit/audit_messages.js
const path = require('path');
const root = path.join(__dirname, '..', '..');
// 综合审计：把 5 个方向的关键检查合并成一个脚本
const fs = require('fs');
const cp = require('child_process');
const vm = require('vm');
const R = `${root}`;
const out = [];
const log = (...a) => { const s = a.join(' '); out.push(s); console.log(s); };
let problems = [];

// ════════════════════════════════════════════════════════════
// 准备：抽取真实的 send_commands + jsonStr
// ════════════════════════════════════════════════════════════
const uSrc = fs.readFileSync(R + '/os/char/user.js', 'utf8');
const uL = uSrc.split('\n');
// jsonStr 定义
const ji = uL.findIndex(l => /function jsonStr\(/.test(l));
let je = ji, d = 0, seen = false;
for (let j = ji; j < uL.length; j++) {
    d += (uL[j].match(/\{/g) || []).length - (uL[j].match(/\}/g) || []).length;
    if (uL[j].includes('{')) seen = true;
    if (seen && d === 0) { je = j; break; }
}
const scStart = uL.findIndex(l => l.includes('USER.prototype.send_commands = function'));
let scEnd = scStart; d = 0; seen = false;
for (let j = scStart; j < uL.length; j++) {
    d += (uL[j].match(/\{/g) || []).length - (uL[j].match(/\}/g) || []).length;
    if (uL[j].includes('{')) seen = true;
    if (seen && d === 0) { scEnd = j; break; }
}
const scCode = uL.slice(ji, je + 1).join('\n') + '\n' +
    uL.slice(scStart, scEnd + 1).join('\n').replace('USER.prototype.send_commands = ', 'send_commands = ');
const wire = [];
const st = {}; vm.createContext(st); st.__f = { send: s => wire.push(s) };
vm.runInContext(scCode + '\nthis.__sc = send_commands; this.__js = jsonStr;', st);
const sendCommands = st.__sc.bind(st.__f);
const jsonStr = st.__js;
log('准备：send_commands 已抽取（第 ' + (scStart + 1) + '-' + (scEnd + 1) + ' 行），jsonStr 第 ' + (ji + 1) + '-' + (je + 1) + ' 行');

// ════════════════════════════════════════════════════════════
// 检查 1：options 字段 32 种组合是否都产出合法 JSON
// ════════════════════════════════════════════════════════════
log('\n════════ 1. send_commands 的 32 种字段组合 ════════');
const opts = {
    html: '<div>hi</div>', text: '说明文字', size: 'lg', feedback: '提示', persistent: true,
};
const keys = Object.keys(opts);
let comboBad = 0;
for (let mask = 0; mask < 32; mask++) {
    const o = {};
    keys.forEach((k, i) => { if (mask & (1 << i)) o[k] = opts[k]; });
    wire.length = 0;
    try { sendCommands('cmd1', '按钮1', o); } catch (e) { log('  ✗ 组合 ' + mask + ' 抛错: ' + e.message); comboBad++; continue; }
    if (wire.length !== 1) { log('  ✗ 组合 ' + mask + ' 未发出报文'); comboBad++; continue; }
    try {
        const parsed = new Function('return ('+wire[0]+')')();
        // 校验字段落到了正确位置
        for (const k of Object.keys(o)) {
            const v = parsed[k];
            const ok = (k === 'persistent') ? v === true : v === o[k];
            if (!ok) { log('  ✗ 组合 ' + mask + ' 字段 ' + k + ' 值不对: ' + JSON.stringify(v)); comboBad++; }
        }
    } catch (e) {
        log('  ✗ 组合 ' + mask + ' 非法 JSON: ' + e.message);
        log('     报文: ' + wire[0].slice(0, 200));
        comboBad++;
    }
}
log('  32 种组合：' + (comboBad === 0 ? '全部产出合法 JSON 且字段正确 ✓' : comboBad + ' 个有问题 ✗'));
if (comboBad) problems.push('send_commands 字段组合存在非法 JSON');

// 无 options / 空参数 / 只有 options
log('\n  --- 边界调用 ---');
const edge = [
    ['无参数', () => sendCommands()],
    ['只有 options', () => sendCommands({ html: '<b>x</b>' })],
    ['单个字符串（历史误写）', () => sendCommands('')],
    ['奇数参数', () => sendCommands('cmd1', 'name1', 'orphan')],
    ['cmd 为空串的成对', () => sendCommands('', 'name1')],
    ['cmd 为 undefined', () => sendCommands(undefined, undefined)],
];
for (const [nm, fn] of edge) {
    wire.length = 0;
    try { fn(); } catch (e) { log('  ✗ ' + nm + ' 抛错: ' + e.message); problems.push(nm + ' 抛错'); continue; }
    let ok = false, n = -1, note = '';
    try {
        const p = new Function('return ('+wire[0]+')')();
        n = (p.items || []).length;
        const empties = (p.items || []).filter(x => !x.cmd).length;
        ok = true;
        note = 'items=' + n + ' 空cmd=' + empties + ' html=' + (p.html ? '有' : '无');
        if (empties) { note += '  ✗ 有空cmd按钮'; problems.push(nm + ' 产出空 cmd 按钮'); ok = false; }
    } catch (e) { note = '非法 JSON: ' + e.message; problems.push(nm + ' 非法 JSON'); }
    log('  ' + (ok ? 'OK ' : 'BAD') + ' ' + nm.padEnd(22) + note);
    log('        ' + String(wire[0] || '(无报文)').slice(0, 150));
}

// ════════════════════════════════════════════════════════════
// 检查 2：jsonStr 的转义完整性（逐个危险字符）
// ════════════════════════════════════════════════════════════
log('\n════════ 2. jsonStr 转义完整性 ════════');
const danger = {
    '双引号': '"', '反斜杠': '\\', '换行': '\n', '回车': '\r', '制表': '\t',
    '退格': '\b', '换页': '\f', '斜杠': '/', '中文': '中文',
    'emoji': '😀', 'U+2028': '\u2028', 'U+2029': '\u2029', 'NUL': '\u0000',
    'BEL': '\u0007', 'ESC': '\u001b', '孤立代理': '\ud800', '代理对': '😀'.charAt(0),
    '全角引号': '「」', '反引号': '`', '单引号': "'", 'HTML': '<script>',
};
let jsBad = 0;
for (const [nm, ch] of Object.entries(danger)) {
    const s = 'z' + ch + 'z';
    let enc;
    try { enc = jsonStr(s); } catch (e) { log('  ✗ ' + nm + ' jsonStr 抛错: ' + e.message); jsBad++; continue; }
    // 把转义结果塞进一个 JSON 字符串位置再解析，验证往返一致
    const doc = '{"v":' + enc + '}';
    let round;
    try { round = JSON.parse(doc).v; } catch (e) {
        log('  ✗ ' + nm + ' 转义后无法解析: ' + e.message);
        log('       jsonStr=' + JSON.stringify(enc));
        jsBad++; continue;
    }
    const same = round === s;
    if (!same) {
        log('  ✗ ' + nm + ' 往返不一致: 原=' + JSON.stringify(s) + ' 回=' + JSON.stringify(round));
        jsBad++;
    }
}
log('  危险字符往返：' + (jsBad === 0 ? '全部一致 ✓' : jsBad + ' 个不一致 ✗'));
if (jsBad) problems.push('jsonStr 对 ' + jsBad + ' 类字符转义不完整');

// 真实调用路径上验证：把危险字符放进 html/feedback/text
log('\n  --- 经 send_commands 的完整链路（危险字符进 html/feedback/text）---');
for (const [nm, ch] of Object.entries(danger)) {
    const s = 'a' + ch + 'b';
    wire.length = 0;
    try { sendCommands('cmd', 'n', { html: s, feedback: s, text: s }); } catch (e) { log('  ✗ ' + nm + ' 抛错'); jsBad++; continue; }
    try {
        const p = new Function('return ('+wire[0]+')')();
        if (p.html !== s || p.feedback !== s || p.text !== s) {
            log('  ✗ ' + nm + ' 链路往返不一致（html=' + JSON.stringify(p.html) + '）');
            jsBad++;
        }
    } catch (e) { log('  ✗ ' + nm + ' 链路非法 JSON: ' + e.message); jsBad++; }
}
log('  完整链路：' + (jsBad === 0 ? '全部一致 ✓' : '有问题 ✗'));

// ════════════════════════════════════════════════════════════
// 检查 3：float_dialog 的 fallback —— 关闭时是否有路径什么都不显示
// ════════════════════════════════════════════════════════════
log('\n════════ 3. Setting.float_dialog 的 fallback 覆盖 ════════');
const scanDirs = ['world', 'os', 'src'];
const files = [];
for (const dir of scanDirs) {
    (function walk(d) {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            if (['node_modules', '.git', 'log', 'logs', 'data', 'www', 'assets'].includes(e.name)) continue;
            const p = d + '/' + e.name;
            if (e.isDirectory()) walk(p); else if (e.name.endsWith('.js')) files.push(p);
        }
    })(R + '/' + dir);
}
const fdHits = [];
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const lines = src.split('\n');
    lines.forEach((l, i) => {
        if (/float_dialog/.test(l)) fdHits.push({ rel: f.replace(R + '/', ''), line: i + 1, text: l.trim() });
    });
}
log('  引用 float_dialog 的位置共 ' + fdHits.length + ' 处：');
for (const h of fdHits) log(`    ${h.rel}:${h.line}  ${h.text.slice(0, 120)}`);
// 对每个命中点，检查其 if 块内是否有 return / 是否有 else 分支
log('\n  --- 逐个检查是否为「开启时渲染、关闭时无输出」 ---');
for (const h of fdHits) {
    if (/^(var|const|let|\/\/|\*)/.test(h.text)) continue;
    const src = fs.readFileSync(R + '/' + h.rel, 'utf8').split('\n');
    const win = src.slice(h.line - 1, Math.min(src.length, h.line + 26)).join('\n');
    const hasElse = /\}\s*else\b/.test(win);
    const hasFallback = /me\.notify|player\.notify|notify\(|send_commands|send\(/.test(win);
    log(`    ${h.rel}:${h.line}  else=${hasElse ? '有' : '无'}  后续有输出调用=${hasFallback ? '有' : '无'}`);
}

// ════════════════════════════════════════════════════════════
// 检查 4：Setting.float_dialog 的默认值（undefined 时走哪条路）
// ════════════════════════════════════════════════════════════
log('\n════════ 4. float_dialog 默认值 ════════');
for (const f of ['src/setting.js', 'src/setting.js', 'src/config.js']) {
    if (!fs.existsSync(R + '/' + f)) continue;
    const src = fs.readFileSync(R + '/' + f, 'utf8');
    const m = src.match(/float_dialog[^\n]*/g);
    log('  ' + f + ': ' + (m ? m.join(' | ') : '(未提及 float_dialog)'));
}
// 客户端所有 Setting 默认值定义
for (const f of files.filter(x => x.includes('/src/') && /setting|config/.test(x))) {
    const src = fs.readFileSync(f, 'utf8');
    if (!/float_dialog/.test(src)) continue;
    log('  定义点 ' + f.replace(R + '/', '') + ':');
    src.split('\n').forEach((l, i) => { if (/float_dialog/.test(l)) log('    ' + (i + 1) + ': ' + l.trim()); });
}

// ════════════════════════════════════════════════════════════
// 检查 5：{type:"cmds"} 生成点全清单
// ════════════════════════════════════════════════════════════
log('\n════════ 5. {type:"cmds"} 生成点清单 ════════');
const cmdsHits = [];
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    src.split('\n').forEach((l, i) => {
        if (/type:\\?"cmds\\?"|type:\s*"cmds"|'cmds'|"cmds"/.test(l)) {
            cmdsHits.push({ rel: f.replace(R + '/', ''), line: i + 1, text: l.trim() });
        }
    });
}
log('  共 ' + cmdsHits.length + ' 处：');
for (const h of cmdsHits) log(`    ${h.rel}:${h.line}  ${h.text.slice(0, 110)}`);

// ════════════════════════════════════════════════════════════
// 检查 6：数据隔离——缓存空集合的风险
// ════════════════════════════════════════════════════════════
log('\n════════ 6. 数据隔离：collect_local_ids 的缓存与误伤 ════════');
const dataSrc = fs.readFileSync(R + '/world/extends/data.js', 'utf8');
const cid = dataSrc.match(/function collect_local_ids[\s\S]*?\n\}/);
if (cid) {
    log('  --- collect_local_ids 实现 ---');
    cid[0].split('\n').forEach((l, i) => log('    ' + (i + 1) + ': ' + l));
    // 缓存是否安全，取决于「失败」和「空」是否被区分开：
    //   失败（抛错 / 返回值不是数组）必须不缓存成空集合，而应缓存 null 并让调用方跳过。
    const cachesOnlyOnArray = /Array\.isArray\(roles\)/.test(cid[0]);
    const cachesNullOnError = /ids:\s*null/.test(cid[0]);
    const safe = cachesOnlyOnArray && cachesNullOnError;
    log('  缓存安全性: ' + (safe
        ? '安全 ✓ （只在拿到真数组时锁存；失败/非数组缓存 null，调用方跳过，不会误删）'
        : '★ 可疑 —— 需人工确认「失败」与「空」是否被区分'));
    if (!safe) problems.push('collect_local_ids 的缓存可能把「查询失败」当成「本服无角色」');
} else log('  ✗ 未找到 collect_local_ids');
const sfs = dataSrc.match(/function sanitize_foreign_stats[\s\S]*?\n\}/);
if (sfs) {
    log('\n  --- sanitize_foreign_stats 实现 ---');
    sfs[0].split('\n').forEach((l, i) => log('    ' + (i + 1) + ': ' + l));
} else log('  ✗ 未找到 sanitize_foreign_stats');

log('\n════════ 汇总 ════════');
if (problems.length === 0) log('  未发现上述检查项中的问题');
else { log('  发现 ' + problems.length + ' 个疑点：'); problems.forEach(p => log('    - ' + p)); }
fs.writeFileSync('/tmp/audit-report.txt', out.join('\n'));
log('\n  (完整报告已存 /tmp/audit-report.txt)');
