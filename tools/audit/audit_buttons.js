// 只读审计工具（不修改任何文件）。用法：仓库根目录执行 node tools/audit/audit_buttons.js
const path = require('path');
const root = path.join(__dirname, '..', '..');
// 实测 zc_btn_html / zc_row 的输出，以及 cmd_words 对全部 9 个部位的表现
const fs = require('fs'), vm = require('vm'), cp = require('child_process');

// ---------- 1. 直接抽出函数执行 ----------
const zcSrc = fs.readFileSync(`${root}/world/cmd/skill/zc.js`, 'utf8');
function extractFn(name) {
    const re = new RegExp('function ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}');
    const m = zcSrc.match(re);
    if (!m) throw new Error('未找到 ' + name);
    return m[0];
}
const helpers = ['zc_btn_html', 'zc_row', 'zc_send'].map(extractFn).join('\n');
const fns = new Function(helpers + '; return { zc_btn_html: zc_btn_html, zc_row: zc_row };')();

console.log('════════ 1. zc_btn_html 输出结构检查 ════════');
const btn = fns.zc_btn_html('zc deduce iblt1155ab9d', '推演');
console.log('  ' + btn);
// 逐属性检查引号是否配对
const attrs = [...btn.matchAll(/(\w+)\s*=\s*(["'])((?:(?!\2).)*)\2/g)];
console.log('  解析出的属性:');
for (const a of attrs) console.log(`    ${a[1]} = ${a[2]}...${a[2]}  值=「${a[3].slice(0, 90)}${a[3].length > 90 ? '…' : ''}」`);
console.log('  属性个数: ' + attrs.length + '（应为 3：cmd / onclick / style）');
const style = attrs.find(a => a[1] === 'style');
if (style) {
    console.log('  style 是否以 ; 结尾且完整: ' + (/;[\s\S]*$/.test(style[3]) ? (style[3].endsWith(';') ? 'OK' : '末位不是分号（CSS 仍合法）') : '缺分号'));
    console.log('  style 里是否含未闭合引号: ' + (style[3].includes('"') || style[3].includes("'") ? '★ 含引号，可能破坏属性' : '否 ✓'));
    const decl = style[3].split(';').filter(x => x.trim());
    console.log('  style 声明数: ' + decl.length + ' → ' + decl.map(d => d.split(':')[0].trim()).join(', '));
}
// 用 jsdom 验证浏览器真的解析成 3 个属性、onclick 可执行
try {
    const { JSDOM } = require('/tmp/jsd2/node_modules/jsdom');
    const dom = new JSDOM('<div id=x>' + btn + '</div>', { runScripts: 'outside-only' });
    const w = dom.window, el = w.document.querySelector('[cmd]');
    console.log('  浏览器解析后:');
    console.log('    cmd     = ' + JSON.stringify(el.getAttribute('cmd')));
    console.log('    onclick = ' + JSON.stringify(el.getAttribute('onclick')));
    console.log('    style   = ' + JSON.stringify(el.getAttribute('style')));
    console.log('    计算样式 cursor = ' + w.getComputedStyle(el).cursor + '（应为 pointer）');
    console.log('    计算样式 color  = ' + w.getComputedStyle(el).color);
    let got = null;
    const orig = w.SendCommand;
    w.SendCommand = c => { got = c; };
    w.eval('(function(){ ' + el.getAttribute('onclick') + ' })()');
    console.log('    点击派发命令 = ' + JSON.stringify(got) + (got === 'zc deduce iblt1155ab9d' ? ' ✓' : ' ✗'));
} catch (e) { console.log('  (jsdom 不可用: ' + e.message + ')'); }

console.log('\n════════ 2. 特殊字符注入检查 ════════');
for (const nasty of ['zc x"><script>alert(1)</script>', "zc x' onmouseover='alert(1)", 'zc a&b', 'zc 中文']) {
    const b = fns.zc_btn_html(nasty, '标签');
    const cmd = (b.match(/cmd="([^"]*)"/) || [])[1];
    const bad = b.includes('<script>') && !b.includes('&lt;script&gt;');
    console.log('  输入 ' + JSON.stringify(nasty));
    console.log('    cmd 属性 = ' + JSON.stringify(cmd));
    console.log('    ' + (bad ? '✗ 未转义 <script>' : '✓ 尖括号已实体化') + '   onclick 里引号已实体化: ' + (b.includes('&quot;') || !nasty.includes('"') ? '✓' : '✗'));
}

console.log('\n════════ 3. cmd_words 对全部 9 个部位（真实角色数据）════════');
const raw = cp.execSync(`sqlite3 ${root}/data/database.db "select data from players where name='天尘'"`).toString();
const mm = raw.match(/\["zc\/blank_book","([^"]+)",1,\{"zc":"((?:[^"\\]|\\.)*)"\}/);
const bookId = mm[1];
const zc = JSON.parse(JSON.parse('"' + mm[2] + '"'));
const skillId = zc.sid;

const uL = fs.readFileSync(`${root}/os/char/user.js`, 'utf8').split('\n');
const uhi = uL.findIndex(l => l.includes('function jsonStr('));
const usi = uL.findIndex(l => l.includes('USER.prototype.send_commands = function'));
let d = 0, seen = false, uei = null;
for (let j = usi; j < uL.length; j++) {
    d += (uL[j].match(/\{/g) || []).length - (uL[j].match(/\}/g) || []).length;
    if (uL[j].includes('{')) seen = true;
    if (seen && d === 0) { uei = j; break; }
}
const scCode = uL.slice(uhi, usi).join('\n') + '\n' +
    uL.slice(usi, uei + 1).join('\n').replace('USER.prototype.send_commands = ', 'send_commands = ');
const wire = [];
const st = {}; vm.createContext(st); st.__f = { send: s => wire.push(s) };
vm.runInContext(scCode + '\nthis.__sc = send_commands;', st);
const sendCommands = st.__sc.bind(st.__f);

const book = {
    id: bookId, path: 'zc/blank_book', name: zc.nm, color_name: '<hio>' + zc.nm + '</hio>', desc: 'x',
    zc_state: zc.s, zc_name: zc.n, zc_positions: zc.p || [], zc_words: zc.w || {},
    zc_pfms: zc.f || {}, zc_word_levels: zc.wl || {}, zc_skill_id: skillId, grade: zc.gd || 6,
    has_position(k) { return (this.zc_positions || []).indexOf(k) >= 0; },
    get_total_pfms() { let n = 0; for (const k in (this.zc_pfms || {})) n += (this.zc_pfms[k] || []).length; return n; },
};
const main = [];
const me = {
    name: '天尘', pot: 99999999, items: [book],
    skills: { [skillId]: { level: 3000, addin: [], word_levels: zc.wl || {} } }, temp: {},
    notify(t) { main.push(String(t)); }, send(t) { main.push(String(t)); },
    send_commands: sendCommands,
    set_temp(k, v) { this.temp[k] = v; }, query_temp(k) { return this.temp[k]; },
    find_obj(id) { return id === bookId ? book : null; }, items_changed() { }, recount() { },
    find_obj_bypath() { return null; },
};
const sb = {
    console: { log() { }, error() { }, warn() { } },
    JSON, Math, Object, Array, String, Number, parseInt, parseFloat, isNaN, isFinite, Date, RegExp, Set,
    SKILL: {
        ZC_WORDS: Array.from({ length: 80 }, (_, i) => ({
            name: '词条' + (500 + i), category: i % 3,
            positions: ['sword', 'staff', 'club', 'throwing', 'parry', 'dodge', 'blade', 'unarmed', 'whip', 'force'],
            upgrade_cost: n => 10 * n, value: () => 100, format: v => '效果：+' + v,
        })),
        get(id) { return { id, name: '八九神功', is_custom: true, grade: 6, mp_to_hp: false, pfm: {} }; },
    },
    WORLD: { COMMANDS: {}, STATS: { TOPS: [] }, SERVERID: 100 },
    OBJ: { CREATE: () => null }, NPC: {}, BASE: {}, UTIL: {}, COPY_PROPS: [], COMMAND: function () { },
};
sb.globalThis = sb; vm.createContext(sb);
vm.runInContext('function __load(){' + zcSrc + '\n; return this; }\nthis.__zc = __load.call({inherits:function(){},command:"zc",regex:/^(\\w+)(?:"\\s"(\\w+))?(?:\\s(.+))?$/});',
    sb, { filename: 'zc.js' });
const zObj = sb.__zc, re = zObj.regex;

let allOk = true;
for (const pos of book.zc_positions) {
    main.length = 0; wire.length = 0;
    let err = null, ret;
    try { ret = zObj.cmd_words(me, skillId, bookId + ' ' + pos); } catch (e) { err = e; }
    let o = null, parseErr = null;
    if (wire.length) { try { o = new Function('return (' + wire[0] + ')')(); } catch (e) { parseErr = e.message; } }
    const html = o ? (o.html || '') : '';
    const btns = (html.match(/<span cmd="/g) || []).length;
    const upgrades = (html.match(/>升级<\/span>/g) || []).length;
    const replaces = (html.match(/>替换<\/span>/g) || []).length;
    const words = (book.zc_words[pos] || []).length;
    const ok = !err && !parseErr && main.length === 0 && wire.length === 1
        && upgrades === words && replaces === words && btns > 0;
    if (!ok) allOk = false;
    console.log(`  ${ok ? 'OK ' : 'BAD'} ${pos.padEnd(4)} 报文${wire.length}条 主栏${main.length}条 按钮${btns} 升级${upgrades}/替换${replaces} (词条${words})`
        + (err ? '  ✗' + err.message : '') + (parseErr ? '  ✗JSON ' + parseErr : ''));
}
console.log(allOk ? '\n  ✓ 全部部位菜单正确（升级/替换按钮数 === 词条数，主栏 0 条）' : '\n  ✗ 有异常');
process.exit(allOk ? 0 : 1);
