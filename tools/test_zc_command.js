// 自创武学（zc）命令的端到端回归
//
// 背景：真实事故——点「推演」只回一句「什么？」。
// 链路是：背包查看秘籍 -> get_desc 里的按钮发出 "zc deduce <id>"
//   -> os/char/character.js#do_command 查 WORLD.COMMANDS["zc"]
//   -> 若该命令未注册（或 enter 返回 false），落到末尾 this.send("什么？")
//
// 命令注册失败的原因值得永久防住：zc.js 曾在 zc_btn_html 里写反斜杠转义
//   （生成 onclick="window.SendCommand('...')" 时用了 \'），
//   而游戏加载资源走 BASE.CREATE -> sanitizeScript -> vm.compileFunction，
//   本地 node --check 与既有测试都不经过 sanitizeScript，于是 CI 全绿、
//   线上却"点了没反应"。本测试因此同时覆盖三层：
//
//   1. 静态：命令文件里不得出现 `\'`（字符串内反斜杠+单引号相邻转义）
//   2. 解析：按钮 HTML 的 onclick 用 &#39; / &apos; 实体，源码零转义
//   3. 契约：do_command 的兜底文案与命令表查找方式（防止链路被改坏）
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

// ---- 1. 静态：不得再出现 \' ----
const zcSrc = read('world/cmd/skill/zc.js');
const blankSrc = read('world/obj/zc/blank_book.js');

function findSingleQuoteEscape(src) {
    const hits = [];
    src.split('\n').forEach((line, i) => {
        // 找 \"\\'\"
        for (let k = 0; k < line.length - 1; k++) {
            if (line[k] !== '\\') continue;
            let bs = 0, j = k - 1;
            while (j >= 0 && line[j] === '\\') { bs++; j--; }
            if (bs % 2 === 1) continue;          // 该反斜杠自身被转义
            if (line[k + 1] === "'") hits.push({ line: i + 1, text: line.trim().slice(0, 120) });
        }
    });
    return hits;
}

const zcEscapes = findSingleQuoteEscape(zcSrc);
assert.deepStrictEqual(
    zcEscapes, [],
    'world/cmd/skill/zc.js 中出现了 \\\' 转义。游戏加载时 sanitizeScript 会因此\n' +
    '破坏源码、vm.compileFunction 报语法错误，导致整个 zc 命令未注册，\n' +
    '玩家点「推演」只会收到「什么？」。生成 onclick 请改用 &#39; 实体。\n' +
    zcEscapes.map(h => `  第 ${h.line} 行: ${h.text}`).join('\n')
);

// blank_book.js 里的 _zc_btn 用拼接写法（无 \'），确认它保持这种安全写法
const blankEscapes = findSingleQuoteEscape(blankSrc);
assert.deepStrictEqual(
    blankEscapes, [],
    'world/obj/zc/blank_book.js 中出现了 \\\' 转义（同上风险）:\n' +
    blankEscapes.map(h => `  第 ${h.line} 行: ${h.text}`).join('\n')
);

// ---- 2. 解析：zc_btn_html 必须产出可用的按钮 HTML ----
// 直接抽出函数体在沙箱里执行，验证 cmd 属性与 onclick 都能被浏览器正确还原
const fnMatch = zcSrc.match(/function zc_btn_html\(cmd, label\) \{[\s\S]*?\n\}/);
assert.ok(fnMatch, '未找到 zc_btn_html 函数');
// eslint-disable-next-line no-new-func
const zcBtnHtml = new Function(fnMatch[0] + '; return zc_btn_html;')();

const btn = zcBtnHtml('zc deduce iblt1155ab9d', '推演');
assert.ok(
    btn.indexOf('cmd="zc deduce iblt1155ab9d"') >= 0,
    '按钮缺少正确的 cmd 属性（浮窗靠它派发），实际: ' + btn
);
// onclick 里用实体写单引号；两种实体都接受
const onclickOk = /onclick="window\.SendCommand\(&(#39|apos);zc deduce iblt1155ab9d&(#39|apos);\)"/.test(btn);
assert.ok(onclickOk, '按钮的 onclick 未使用实体化单引号，实际: ' + btn);
assert.strictEqual(
    btn.split('\\').length - 1, 0,
    '按钮 HTML 里不应出现反斜杠（含转义的实现会在 sanitizeScript 下失效）'
);
// 转义：命令里的特殊字符必须被实体化，避免破坏属性
const nasty = zcBtnHtml('zc x"><b>', '标签');
assert.ok(!/cmd="zc x"><b>"/.test(nasty), 'cmd 属性未对引号/尖括号做实体转义');
assert.ok(nasty.indexOf('&quot;') >= 0 && nasty.indexOf('&lt;') >= 0, 'cmd 属性缺少实体转义');

// ---- 3. 契约：命令注册与兜底文案 ----
// zc.js 必须以 COMMAND 子类身份声明 command = "zc"，否则不会进 WORLD.COMMANDS
assert.ok(/this\.inherits\(COMMAND\)/.test(zcSrc), 'zc.js 未继承 COMMAND');
assert.ok(/this\.command\s*=\s*"zc"/.test(zcSrc), 'zc.js 未声明 command = "zc"');
assert.ok(/this\.regex\s*=/.test(zcSrc), 'zc.js 未声明 regex（参数无法解析）');
assert.ok(/this\.enter\s*=\s*function/.test(zcSrc), 'zc.js 未实现 enter（命令入口）');

// 兜底「什么？」出现在 do_command 末尾：命令查表 + enter 返回 false 两条路径
const charSrc = read('os/char/character.js');
assert.ok(
    /var cmd = WORLD\.COMMANDS\[cmdName\];/.test(charSrc),
    'do_command 的查表方式变了（zc 未注册将直接回「什么？」）'
);
assert.ok(
    /this\.send\("什么？"\);/.test(charSrc),
    'do_command 的兜底文案不存在了，本测试的假设需要同步更新'
);
// 关键：决定是否落到兜底的判断是 `!== false`
assert.ok(
    /if \(cmd\.enter\.apply\(cmd, pars\) !== false\)/.test(charSrc),
    'do_command 对 enter 返回值的判断变了（只有严格 false 才继续往下走）'
);

// zc.js 的每个 enter 分支都必须有 return，否则会意外返回 undefined
const enterMatch = zcSrc.match(/this\.enter = function \(me, cmd, arg1, arg2\) \{[\s\S]*?\n\};/);
assert.ok(enterMatch, '未找到 enter 实现');
const branches = enterMatch[0].match(/case "[a-z_]+":/g) || [];
const returns = enterMatch[0].match(/case "[a-z_]+":\s*return /g) || [];
assert.strictEqual(
    branches.length, returns.length,
    `enter 里有 ${branches.length} 个分支但只有 ${returns.length} 个带 return，` +
    '未 return 的分支会返回 undefined（虽然不会触发「什么？」，但会静默无响应）'
);

// ---- 4. 浮窗菜单必须能真的送出 HTML（历史事故：send_commands 漏了 html 字段）----
const userSrc = read('os/char/user.js');
assert.ok(
    /opts\.html/.test(userSrc) && /,html:/.test(userSrc),
    'send_commands 未输出 html 字段——自创武学菜单的 HTML 到不了客户端（浮窗会是空的）'
);
// 且不能把空字符串当成按钮（曾产出 {cmd:""}，点击即发空命令 -> 服务器回「什么？」）
assert.ok(
    /pairCount/.test(userSrc) || /args\.length\s*-\s*1/.test(userSrc),
    'send_commands 未过滤不成对的参数，可能产出空 cmd 按钮'
);

console.log('✓ 自创武学命令回归通过');
console.log(`  zc.js 无 \\' 转义；按钮 HTML: ${btn.slice(0, 78)}…`);
console.log(`  enter 分支 ${branches.length} 个，全部带 return`);
console.log('  send_commands 输出 html 字段且不成对参数不产生按钮');
