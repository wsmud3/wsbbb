// 资源加载回归：复刻游戏真实的加载路径，确保**没有任何会被加载的文件静默失败**
//
// 游戏加载 world/ 下资源的方式不是 require，而是：
//     os/world.js#loadResource  →  BASE.CREATE  →  sanitizeScript(src)  →  vm.compileFunction
// 其中 sanitizeScript 负责把"字符串内含真实换行"的写法（本仓库有 13 个文件这样写）
// 转成合法的 `\n` 转义。因此：
//   1) 有些文件**故意**不是标准 JS，必须经过 sanitize 才合法 —— 这是设计，不是错误
//   2) 但反过来，任何被加载的文件若在 sanitize 之后**仍无法编译**，就会静默失效
//      （BASE.CREATE 只 console.error 后 return undefined）→ 命令不注册 / 物件方法缺失
//      → 玩家看到"点了没反应"或「什么？」。历史上真的发生过（world/cmd/skill/zc.js）。
//
// 本测试同时在最容易出事的地方加断言：
//   - 入站 socket 数据处理必须被 try/catch 包住（异常若逃出去会触发
//     logger 的 uncaughtException → process.exit(1)，即"一个客户端打挂全服"）
//   - 历史裸 TCP 协议的入口必须检查回调是否真的注册了
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

// ── 1. 复用 os/base.js 导出的真实实现（不复制，避免测试与实现漂移）──
// 不能用 eval：vm.compileFunction 看不到本地作用域，那会让所有文件都"失败"。
const { sanitizeScript } = require(path.join(root, 'os', 'base.js'));
assert.strictEqual(typeof sanitizeScript, 'function',
    'os/base.js 必须导出 sanitizeScript（tools/ 下的回归测试依赖它）');

// ── 2. 复刻 loadResource 的扫描范围 ──
// 取自 os/world.js 的 loadResource：EXTENDS/COMMAND/FAMILY/OBJ/AREA/SKILL/MAP/TASK + WORLD/zhenyi
const DIRS = ['world/extends', 'world/cmd', 'world/family', 'world/obj',
    'world/area', 'world/skill', 'world/map', 'world/task'];
const files = [];
for (const d of DIRS) {
    const p = path.join(root, d);
    if (!fs.existsSync(p)) continue;
    (function walk(dir) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) walk(full);
            else if (e.name.endsWith('.js')) files.push(full);
        }
    })(p);
}
const zhenyi = path.join(root, 'world', 'zhenyi.js');
if (fs.existsSync(zhenyi)) files.push(zhenyi);

assert.ok(files.length > 1000,
    `扫描到的资源文件过少（${files.length}），目录结构可能变了，请同步本测试的 DIRS`);

// ── 3. 逐个验证：sanitize 之后必须能编译 ──
const broken = [];
const needsSanitize = [];   // 原码不合法、靠 sanitize 修复的文件（设计如此）
for (const f of files) {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    const src = fs.readFileSync(f, 'utf8');

    let rawOk = true;
    try { vm.compileFunction(src, [], { filename: rel }); } catch (e) { rawOk = false; }
    if (!rawOk) needsSanitize.push(rel);

    let clean;
    try { clean = sanitizeScript(src); }
    catch (e) { broken.push({ rel, why: 'sanitizeScript 抛错: ' + e.message }); continue; }

    try { vm.compileFunction(clean, [], { filename: rel }); }
    catch (e) {
        // 找出 sanitize 输出里第一处异常位置，便于定位
        let where = '';
        const lines = clean.split('\n');
        try { vm.compileFunction(clean, [], { filename: 'x' }); } catch (e2) {
            const mm = String(e2.stack).match(/x:(\d+)/);
            if (mm) where = `（sanitize 输出第 ${mm[1]} 行: ${String(lines[parseInt(mm[1]) - 1]).trim().slice(0, 110)}）`;
        }
        broken.push({ rel, why: e.message + where });
    }
}

console.log(`资源加载回归：扫描 ${files.length} 个会被加载的文件`);
console.log(`  依赖 sanitizeScript 修复的字面换行写法：${needsSanitize.length} 个（设计如此）`);
console.log(`  sanitize 后仍无法编译：${broken.length} 个`);

if (broken.length) {
    console.log('\n以下文件在线上会**静默加载失败**（命令不注册 / 物件方法缺失）：');
    for (const b of broken) console.log(`  ★ ${b.rel}\n      ${b.why}`);
}
assert.strictEqual(broken.length, 0,
    `有 ${broken.length} 个会被加载的资源文件在 sanitizeScript 之后无法编译（见上）。\n` +
    '这类文件在线上不会报错，只会静默失效 —— 表现为命令不存在、物件行为缺失。\n' +
    '常见触发写法：字符串以偶数个反斜杠结尾再接引号（如 "C:\\\\"）、' +
    '正则字面量里含引号（如 /["]/）。请改写这些写法。');

// ── 4. 入站数据处理必须被 try/catch 包住（防"一个客户端打挂全服"）──
const netWs = read('os/net-ws.js');
const dataHandler = netWs.match(/socket\.on\('data',\s*function\s*\(data\)\s*\{([\s\S]*?)\n\s*\}\);/);
assert.ok(dataHandler, '未找到 os/net-ws.js 的 socket.on(\'data\') 处理器');
// 注意：不能只查"函数体内是否出现过 catch" —— tcp.readData 等处内部本来就有
// `catch (_)`，那种写法会让断言形同虚设（测试永远绿）。这里要求：
//   ① 去掉注释与空行后，处理器体的**第一条语句**就是 try {
//   ② 处理器体的**末尾**存在与之配对的 } catch (
const body = dataHandler[1];
const stripped = body
    .split('\n')
    .filter(l => !/^\s*\/\//.test(l) && l.trim() !== '')
    .join('\n')
    .trim();
assert.ok(/^try\s*\{/.test(stripped),
    'socket.on(\'data\') 处理器的第一条语句不是 try 块。\n' +
    '任何从该处理器逃出的异常都会触发 os/logger.js 的 uncaughtException → process.exit(1)，\n' +
    '即"一个客户端打挂全服"（本仓库真实发生过）。实际首行: ' + stripped.split('\n')[0]);
assert.ok(/\}\s*catch\s*\([^)]*\)\s*\{[\s\S]*?\}\s*$/.test(stripped),
    'socket.on(\'data\') 处理器末尾没有与之配对的 } catch 兜底。实际末尾: ' +
    JSON.stringify(stripped.slice(-80)));

// ── 5. 裸 TCP 协议入口必须检查回调是否注册 ──
// 该协议在本仓库没有任何实现者（os/ws.js 从未注册 onTcpReceive），
// 若无条件调用就会 TypeError 打挂进程（曾实测：发 5 字节即重启）。
assert.ok(netWs.includes('onTcpReceive'), 'net-ws.js 中找不到 onTcpReceive（协议入口结构变了，请同步本测试）');
// 直接检查"守卫表达式"是否真的存在。用 indexOf 而不是正则：正则里的 $ 很容易写错，
// 而且这种"检查某个字符串是否存在"的断言必须精确，否则测试会在被破坏时仍然通过。
// 关键：入口处（socket.on('data') 判定裸 TCP 的那一段）必须有守卫。
// 不能写成 "GUARD_1 || GUARD_2" —— readData 里的 GUARD_2 会掩盖入口守卫被删除的回归
// （这正是本断言最初失效的原因，已用"故意破坏"实验验证）。
const GUARD_ENTRY = "typeof $this.onTcpReceive === 'function'";
const GUARD_READ = "typeof server.onTcpReceive === 'function'";
assert.ok(netWs.includes(GUARD_ENTRY),
    'net-ws.js 的裸 TCP **入口**没有检查 onTcpReceive 是否真的注册。\n' +
    'os/ws.js 并未注册该回调，无条件切换协议并调用它会抛 TypeError\n' +
    '→ 触发 logger 的 uncaughtException → process.exit(1)。\n' +
    '（实测：向游戏端口发 5 字节 \\x04look 即可让进程重启。）\n' +
    '期望存在: ' + JSON.stringify(GUARD_ENTRY));
assert.ok(netWs.includes(GUARD_READ),
    'net-ws.js 的 tcp.readData 内没有对 onTcpReceive 做二次存在性检查。\n' +
    '期望存在: ' + JSON.stringify(GUARD_READ));

// ── 6. 确认 os/ws.js 的注册情况与本测试的假设一致 ──
const wsSrc = read('os/ws.js');
const registered = [...wsSrc.matchAll(/server\.(on[A-Z]\w*)\s*=/g)].map(m => m[1]);
assert.ok(registered.length >= 5,
    `os/ws.js 只注册了 ${registered.length} 个回调，结构可能变了，请同步本测试`);
if (!registered.includes('onTcpReceive')) {
    console.log('  提示：os/ws.js 未注册 onTcpReceive（与"裸 TCP 协议无实现者"一致，入口守卫因此生效）');
}

console.log('\n✓ 资源加载回归通过');
console.log('  · 全部会被加载的文件经 sanitizeScript 后可编译');
console.log('  · 入站数据处理有 try/catch 兜底');
console.log('  · 裸 TCP 入口在回调未注册时不会崩溃');
