// 只读审计工具（不修改任何文件）。用法：仓库根目录执行 node tools/audit/audit_callsites.js
// 审计 send_commands 的所有调用点：
//  1) 参数个数（options 对象被 pop 后，剩余是否为偶数）——奇数会被我的 pairCount 静默丢弃
//  2) options 对象里用到的字段——send_commands 只处理 html/text/size/feedback/persistent，
//     其它字段会被静默忽略（潜在 bug）
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');

const files = [];
(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (['node_modules', '.git', 'log', 'logs', 'data', 'www', 'assets'].includes(e.name)) continue;
        const f = path.join(d, e.name);
        if (e.isDirectory()) walk(f); else if (e.name.endsWith('.js')) files.push(f);
    }
})(root + '/world');
(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (['node_modules', '.git', 'log', 'logs', 'data', 'www', 'assets'].includes(e.name)) continue;
        const f = path.join(d, e.name);
        if (e.isDirectory()) walk(f); else if (e.name.endsWith('.js')) files.push(f);
    }
})(root + '/os');

// 把源码里的调用按括号配对切开
function findCalls(src, name) {
    const out = [];
    const re = new RegExp('\\.' + name + '\\s*\\(', 'g');
    let m;
    while ((m = re.exec(src))) {
        let i = m.index + m[0].length, depth = 1, inS = false, inD = false, inT = false, inRe = false;
        const start = i;
        while (i < src.length && depth > 0) {
            const c = src[i];
            if (inS) { if (c === '\\') i++; else if (c === "'") inS = false; i++; continue; }
            if (inD) { if (c === '\\') i++; else if (c === '"') inD = false; i++; continue; }
            if (inT) { if (c === '\\') i++; else if (c === '`') inT = false; i++; continue; }
            if (c === "'") { inS = true; i++; continue; }
            if (c === '"') { inD = true; i++; continue; }
            if (c === '`') { inT = true; i++; continue; }
            if (c === '(') depth++;
            else if (c === ')') depth--;
            i++;
        }
        out.push({ text: src.slice(start, i - 1), line: src.slice(0, m.index).split('\n').length });
    }
    return out;
}

// 顶层逗号切分（忽略嵌套括号/引号/正则）
function splitArgs(s) {
    const parts = [];
    let depth = 0, cur = '', inS = false, inD = false, inT = false;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inS) { cur += c; if (c === '\\') { cur += s[++i] || ''; } else if (c === "'") inS = false; continue; }
        if (inD) { cur += c; if (c === '\\') { cur += s[++i] || ''; } else if (c === '"') inD = false; continue; }
        if (inT) { cur += c; if (c === '\\') { cur += s[++i] || ''; } else if (c === '`') inT = false; continue; }
        if (c === "'") { inS = true; cur += c; continue; }
        if (c === '"') { inD = true; cur += c; continue; }
        if (c === '`') { inT = true; cur += c; continue; }
        if ('([{'.includes(c)) depth++;
        if (')]}'.includes(c)) depth--;
        if (c === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; continue; }
        cur += c;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
}

const ODD = [], OPTS = {}, USES_APPLY = [], NAMES = new Set();
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const rel = f.replace(root + '/', '');
    for (const call of findCalls(src, 'send_commands')) {
        const args = splitArgs(call.text);
        // 最后一个参数是不是对象字面量（会被当 options）
        const last = args[args.length - 1] || '';
        const isOpts = /^\{/.test(last);
        const body = isOpts ? args.slice(0, -1) : args;
        if (body.length % 2 !== 0) {
            ODD.push({ rel, line: call.line, n: body.length, text: call.text.replace(/\s+/g, ' ').slice(0, 150) });
        }
        if (isOpts) {
            const keyRe = /([A-Za-z_$][\w$]*)\s*:/g;
            let k;
            while ((k = keyRe.exec(last))) {
                OPTS[k[1]] = (OPTS[k[1]] || 0) + 1;
                if (!['html', 'text', 'size', 'feedback', 'persistent'].includes(k[1])) {
                    NAMES.add(k[1] + '  ←  ' + rel + ':' + call.line);
                }
            }
        }
    }
    if (new RegExp('send_commands\\.apply').test(src)) USES_APPLY.push(rel);
}

console.log('  扫描 ' + files.length + ' 个文件');
console.log('\n  === options 对象里出现过的字段（send_commands 只认 html/text/size/feedback/persistent）===');
for (const [k, v] of Object.entries(OPTS).sort((a, b) => b[1] - a[1])) {
    const handled = ['html', 'text', 'size', 'feedback', 'persistent'].includes(k);
    console.log('    ' + (handled ? 'OK   ' : '未处理 ') + k.padEnd(12) + v + ' 次');
}
if (NAMES.size) {
    console.log('\n  ⚠ 以下字段会被 send_commands 静默忽略：');
    for (const n of NAMES) console.log('      ' + n);
}
console.log('\n  === 参数个数为奇数（会被 pairCount 丢弃最后一个）===');
if (!ODD.length) console.log('    （无）');
for (const o of ODD) console.log(`    ${o.rel}:${o.line}  参数${o.n}个  ${o.text}`);
console.log('\n  === 使用 send_commands.apply 的文件（参数由数组动态构造，需人工看）===');
for (const u of USES_APPLY) console.log('    ' + u);
