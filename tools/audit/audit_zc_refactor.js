// 只读审计工具（不修改任何文件）。用法：仓库根目录执行 node tools/audit/audit_zc_refactor.js
const path = require('path');
const root = path.join(__dirname, '..', '..');
// 逐函数对比新旧实现：找出我重写 cmd_words / cmd_pfms / cmd_skill_info 时丢失的信息
const cp = require('child_process');
const fs = require('fs');
const R = `${root}`;

function show(ref, file, fnName) {
    try {
        const src = cp.execSync(`cd ${R} && git show ${ref}:${file}`, { maxBuffer: 1e8 }).toString();
        const re = new RegExp('this\\.' + fnName + ' = function[\\s\\S]*?\\n\\};');
        const m = src.match(re);
        return m ? m[0] : '(未找到)';
    } catch (e) { return '(读取失败: ' + e.message.slice(0, 80) + ')'; }
}
function cur(file, fnName) {
    const src = fs.readFileSync(R + '/' + file, 'utf8');
    const re = new RegExp('this\\.' + fnName + ' = function[\\s\\S]*?\\n\\};');
    const m = src.match(re);
    return m ? m[0] : '(未找到)';
}

// 提取一个函数里出现的"信息项"：notify/lines.push 的字符串片段、变量名
function infoTokens(code) {
    const toks = new Set();
    // 字符串字面量里的中文/字段名
    for (const m of code.matchAll(/["'`]([^"'`\n]{2,60})["'`]/g)) {
        const s = m[1];
        if (/[\u4e00-\u9fa5]/.test(s) || /[A-Za-z_]{3,}/.test(s)) toks.add(s.trim());
    }
    // 关键变量
    for (const m of code.matchAll(/\b(valStr|valFmt|max_affordable|hard_cap|upgrade_cost|wudaoCount|srcName|pfmName|posLabel|cost|wl|wdef|skill\.name|book\.grade|Lv\.|mp_to_hp)\b/g)) {
        toks.add('VAR:' + m[1]);
    }
    return toks;
}

const targets = [
    ['world/cmd/skill/zc.js', 'cmd_words'],
    ['world/cmd/skill/zc.js', 'cmd_pfms'],
    ['world/cmd/skill/zc.js', 'cmd_skill_info'],
];
const OLDREFS = ['9a5d88a', '55f9e6d'];

for (const [file, fn] of targets) {
    console.log('\n' + '═'.repeat(70));
    console.log('函数 ' + fn + '（' + file + '）');
    console.log('═'.repeat(70));
    const now = cur(file, fn);
    for (const ref of OLDREFS) {
        const old = show(ref, file, fn);
        if (old.startsWith('(')) { console.log('  旧版 ' + ref + ': ' + old); continue; }
        const a = infoTokens(old), b = infoTokens(now);
        const lost = [...a].filter(x => !b.has(x));
        const added = [...b].filter(x => !a.has(x));
        console.log(`  旧版 ${ref}: ${old.length} 字节 → 新版 ${now.length} 字节`);
        console.log(`    ★ 旧版有、新版可能丢失 (${lost.length}):`);
        for (const l of lost.slice(0, 25)) console.log('        ' + l);
        if (lost.length > 25) console.log('        …还有 ' + (lost.length - 25) + ' 项');
        console.log(`    新增 (${added.length}): ` + added.slice(0, 12).join(' | '));
        break; // 只看最早的那个 ref
    }
}

// 关键：cmd_words 的防呆逻辑是否完整保留
console.log('\n' + '═'.repeat(70));
console.log('关键防呆逻辑检查（cmd_words）');
console.log('═'.repeat(70));
const zcNow = fs.readFileSync(R + '/world/cmd/skill/zc.js', 'utf8');
const wNow = (zcNow.match(/this\.cmd_words = function[\s\S]*?\n\};/) || [''])[0];
const wOld = show('9a5d88a', 'world/cmd/skill/zc.js', 'cmd_words');
for (const [nm, re] of [
    ['hard_cap 剑心 541 上限 269', /hard_cap\s*=\s*\(widx === 541\)\s*\?\s*269/],
    ['max_affordable 累积潜能上限', /max_affordable/],
    ['upgrade_cost 累积计算', /cum_cost\s*\+=/],
    ['_confirm lvlset 命令', /_confirm lvlset/],
    ['set_temp zc_lvl_position', /set_temp\(\s*["']zc_lvl_position["']/],
    ['zone 部位切换标签', /zc words/],
    ['武道书数量显示', /武道书/],
    ['词条等级 Lv.', /Lv\./],
    ['mp_to_hp 内力转气血说明', /mp_to_hp/],
    ['get_wl 读取词条等级', /get_wl/],
]) {
    const a = re.test(wOld), b = re.test(wNow);
    const flag = a && b ? 'OK   ' : (a && !b ? '★丢失' : (!a && b ? '新增 ' : '两者都无'));
    console.log('  ' + flag + ' ' + nm + '  (旧=' + a + ' 新=' + b + ')');
}
