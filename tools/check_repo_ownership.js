// 部署前自检：找出会**静默阻塞自动部署**的仓库状态问题
//
// 背景（真实事故）：仓库里一度有 23 个 root 属主的文件（含 deploy/pull.sh、main.js、
// ecosystem.config.js、api/*）。deploy/pull.sh 以 mud 身份运行，git 无法覆盖/删除
// 非自己属主的文件，于是 `git merge --ff-only` 会在**恰好需要改动那些文件的那次更新**上
// 失败。表现为：部署一直不生效，log/deploy.log 里只有含糊的
// `Deployment failed at line 31`，很难定位。
//
// 本脚本把这些状态问题在部署**之前**显式报出来，能自动修的（以 root 运行时）就自动修。
//
// 用法：
//   node tools/check_repo_ownership.js            # 只检查、报告（退出码 1 表示有问题）
//   node tools/check_repo_ownership.js --fix      # 尝试修复属主（需要 root）
//   node tools/check_repo_ownership.js --quiet    # 只在有问题时输出
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const FIX = argv.includes('--fix');
const QUIET = argv.includes('--quiet');
const EXPECT_USER = process.env.MUD_OWNER || 'mud';
const EXPECT_GROUP = process.env.MUD_GROUP || 'mudmod';

const log = (...a) => { if (!QUIET) console.log(...a); };
const problems = [];
const repairable = [];

// ── git 的已跟踪文件（只关心这些：部署要覆盖的正是它们）──
let tracked = [];
try {
    tracked = cp.execFileSync('git', ['ls-files'], { cwd: root, maxBuffer: 1 << 28 })
        .toString().split('\n').filter(Boolean);
} catch (e) {
    console.log('  ! 无法读取 git 已跟踪文件列表（不是 git 仓库？）: ' + (e.message || '').slice(0, 120));
    process.exit(0);
}

// ── 1. 已跟踪文件/目录的属主 ──
const uidOf = name => { try { return (cp.execFileSync('id', ['-u', name], { stdio: 'pipe' }) || '').toString().trim(); } catch (e) { return null; } };
const expectUid = uidOf(EXPECT_USER);
if (!expectUid) log(`  ! 系统里没有用户 ${EXPECT_USER}，跳过属主检查`);
else {
    const wrong = [];
    const seenDir = new Set();
    for (const rel of tracked) {
        const p = path.join(root, rel);
        let st;
        try { st = fs.lstatSync(p); } catch (e) { continue; }  // 缺失文件由 git status 反映
        if (String(st.uid) !== expectUid) wrong.push({ rel, uid: st.uid, dir: st.isDirectory() });
        // 同时看所在目录：目录属主不对，git 也无法在其中创建/删除文件
        const dir = path.dirname(p);
        if (dir !== root && !seenDir.has(dir)) {
            seenDir.add(dir);
            try {
                const ds = fs.statSync(dir);
                if (String(ds.uid) !== expectUid) wrong.push({ rel: path.relative(root, dir) + '/', uid: ds.uid, dir: true });
            } catch (e) { }
        }
    }
    if (wrong.length) {
        problems.push(`${wrong.length} 个已跟踪文件/目录的属主不是 ${EXPECT_USER} → git 无法覆盖它们，部署会在"恰好要改到它们"时失败`);
        repairable.push(...wrong.map(w => w.rel));
        log(`  ✗ 属主异常 ${wrong.length} 个：`);
        for (const w of wrong.slice(0, 15)) log(`      uid=${w.uid} ${w.rel}`);
        if (wrong.length > 15) log(`      …还有 ${wrong.length - 15} 个`);
    } else {
        log(`  ✓ 已跟踪文件/目录属主均为 ${EXPECT_USER}（共 ${tracked.length} 项）`);
    }
}

// ── 2. 会阻塞合并的其它状态 ──
function git(args) {
    try { return cp.execFileSync('git', args, { cwd: root, stdio: 'pipe', maxBuffer: 1 << 26 }).toString().trim(); }
    catch (e) { return null; }
}
const head = git(['rev-parse', '--abbrev-ref', 'HEAD']);
if (head && head !== 'main') {
    problems.push(`当前分支是 ${head} 而不是 main → 部署会 ff-only 合并失败或产生分叉`);
    log(`  ✗ 当前分支: ${head}（应为 main）`);
} else if (head) log(`  ✓ 分支: main`);

const dirty = git(['status', '--porcelain']);
if (dirty === null) log('  ! 无法执行 git status');
else if (dirty) {
    const n = dirty.split('\n').filter(Boolean).length;
    problems.push(`工作区有 ${n} 处未提交改动 → deploy/pull.sh 会直接拒绝部署`);
    log(`  ✗ 工作区不干净（${n} 处）:`);
    dirty.split('\n').slice(0, 10).forEach(l => log('      ' + l));
} else log('  ✓ 工作区干净');

// .git 的属主/可写性（git 需要写 index）
try {
    const gitDir = path.join(root, '.git');
    if (fs.existsSync(gitDir)) {
        const st = fs.statSync(gitDir);
        if (expectUid && String(st.uid) !== expectUid) {
            // .git 属主不同不一定是问题（取决于运行用户），只在不可写时报警
            try { fs.accessSync(gitDir, fs.constants.W_OK); log('  ✓ .git 可写（属主不同但权限允许）'); }
            catch (e) { problems.push('.git 不可写 → git 无法更新索引，所有 git 写操作都会失败'); log('  ✗ .git 不可写'); }
        } else log('  ✓ .git 属主/权限正常');
    }
    // 残留的锁文件会让后续 git 操作直接失败
    for (const lock of ['index.lock', 'HEAD.lock', 'shallow.lock', 'packed-refs.lock']) {
        const lp = path.join(root, '.git', lock);
        if (fs.existsSync(lp)) {
            problems.push(`存在残留锁文件 .git/${lock} → git 写操作会失败（确认没有 git 在跑后删除它）`);
            log(`  ✗ 残留锁文件: .git/${lock}`);
        }
    }
} catch (e) { log('  ! 检查 .git 时出错: ' + (e.message || '').slice(0, 100)); }

// 远端落后情况（不阻断，仅提示）
const local = git(['rev-parse', 'HEAD']);
const remote = git(['rev-parse', 'origin/main']);
log(`  · HEAD=${(local || '?').slice(0, 7)}  origin/main=${(remote || '?').slice(0, 7)}`);

// ── 3. 修复 ──
if (problems.length && FIX && repairable.length) {
    const amRoot = (() => { try { return process.getuid && process.getuid() === 0; } catch (e) { return false; } })();
    if (!amRoot) {
        log('  ! 需要 root 才能修复属主；当前不是 root，跳过修复');
    } else {
        log(`  → 修复 ${repairable.length} 个属主…`);
        // 用 chown 直接改属主（保持 mode），逐个执行以免一个失败影响全部
        let ok = 0, fail = 0;
        const { execFileSync } = cp;
        for (const rel of repairable) {
            try { execFileSync('chown', ['-R', `${EXPECT_USER}:${EXPECT_GROUP}`, path.join(root, rel)], { stdio: 'pipe' }); ok++; }
            catch (e) { fail++; }
        }
        log(`  → 修复完成：成功 ${ok}，失败 ${fail}`);
        if (fail === 0) {
            // 复核
            const left = repairable.filter(rel => {
                try { return String(fs.lstatSync(path.join(root, rel)).uid) !== expectUid; } catch (e) { return false; }
            });
            if (left.length === 0) {
                log('  ✓ 属主问题已全部修复');
                const idx = problems.findIndex(p => p.includes('属主'));
                if (idx >= 0) problems.splice(idx, 1);
            } else log(`  ! 仍有 ${left.length} 个未修复`);
        }
    }
}

// ── 汇总 ──
if (problems.length) {
    console.log('');
    console.log('  会阻塞自动部署的问题 ' + problems.length + ' 项：');
    problems.forEach((p, i) => console.log(`    ${i + 1}. ${p}`));
    if (!FIX && repairable.length) console.log('  （属主类问题可用 --fix 自动修复）');
    process.exit(1);
}
log('');
log('  ✓ 未发现会阻塞自动部署的状态问题');
process.exit(0);
