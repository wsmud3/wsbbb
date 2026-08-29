// 山外山秘境静态校验：文件齐备、房间引用有效、入口注册、解锁补丁、词条池属性与技能表合法。
// 用法：node tools/validate_sws.js；已纳入 npm run validate:systems。
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let failed = 0;
function check(ok, msg) {
    if (ok) {
        console.log('  [OK] ' + msg);
    } else {
        failed++;
        console.error('  [FAIL] ' + msg);
    }
}

function read(p) {
    return fs.readFileSync(path.join(root, p), 'utf8');
}

// 收集 world/skill 下所有技能文件名（不含 .js），用于校验 NPC 技能表引用
function collectSkillIds(dir, out) {
    out = out || {};
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) collectSkillIds(full, out);
        else if (name.endsWith('.js')) out[name.slice(0, -3)] = true;
    }
    return out;
}

console.log('== 山外山（sws）静态校验 ==');

// 1. 核心文件存在
const files = [
    'world/area/map/sws.js',
    'world/map/sws/ceng.js',
    'world/map/sws/ceng2.js',
    'world/npc/sws/shouhu.js',
];
for (const f of files) {
    check(fs.existsSync(path.join(root, f)), '文件存在: ' + f);
}
if (failed) {
    process.exit(1);
}

const areaSrc = read('world/area/map/sws.js');
const cengSrc = read('world/map/sws/ceng.js');
const ceng2Src = read('world/map/sws/ceng2.js');
const npcSrc = read('world/npc/sws/shouhu.js');
const jhSrc = read('world/cmd/dialog/jh.js');
const userExtSrc = read('world/extends/char/user.js');
const constSrc = read('os/const.js');

// 2. 区域注册与入口
check(/sws:\s*10/.test(jhSrc), 'jh.js 禁地表注册 sws:10');
check(/jd_index:\s*10/.test(areaSrc), 'area 定义 jd_index:10');
check(/id:\s*"sws"/.test(areaSrc), 'area 定义 id:sws');
check(/is_copy:\s*true/.test(areaSrc) && /not_fb:\s*true/.test(areaSrc), 'area 为独立副本（is_copy + not_fb）');
check(/宗师/.test(areaSrc), '入口校验包含宗师境界提示');
check(/_sws_orig_check_unlock/.test(userExtSrc), 'user.js 挂载宗师自动解锁补丁');
check(/SWS_JD_INDEX\s*=\s*10/.test(userExtSrc), '解锁补丁使用禁地位 10');

// 3. 房间互相引用与出口目标存在
check(/"up":\s*"sws\/ceng2"/.test(cengSrc), 'ceng 出口 up → sws/ceng2');
check(/"up":\s*"sws\/ceng"/.test(ceng2Src), 'ceng2 出口 up → sws/ceng');
check(/"out":\s*"yz\/guangchang"/.test(cengSrc) && /"out":\s*"yz\/guangchang"/.test(ceng2Src), '两间均有离开出口 → 扬州中央广场');
check(fs.existsSync(path.join(root, 'world/map/yz/guangchang.js')), '出口目标房间 yz/guangchang 存在');
check(/sws_setup_room/.test(cengSrc) && /sws_setup_room/.test(ceng2Src), '两间房间委托 area 布置');
check(/sws_room_leave/.test(cengSrc) && /sws_room_leave/.test(ceng2Src), '两间房间挂出口闸门');

// 4. 核心状态机：守护者生成/击败/择意/闸门/结束清理
for (const fn of ['sws_start_run', 'sws_setup_room', 'sws_enter_fight', 'sws_room_leave',
    'sws_on_npc_die', 'sws_choose', 'sws_die_hook', 'sws_end_run', 'sws_reapply_buffs', 'sws_show_picks']) {
    check(areaSrc.indexOf(fn) >= 0, 'area 实现函数: ' + fn);
}
check(/add_action\("sws_pick",\s*null/.test(cengSrc) && /add_action\("sws_pick",\s*null/.test(ceng2Src), '三选一按钮命令注册（房间无名动作 sws_pick，不进动作栏）');
check(/send_commands\.apply/.test(areaSrc) && /sws_pick "\s*\+\s*b\.key/.test(areaSrc), '三选一以对话按钮（send_commands）发送');
check(/NPC\.CLONE\("sws\/shouhu"\)/.test(areaSrc), '守护者克隆自 sws/shouhu');
check(/sws_picked/.test(areaSrc), '使用 picked 标记区分战斗中/已择意');
check(/USER\.prototype\.die/.test(areaSrc), '结束时恢复默认死亡钩子');

// 5. 守护者：按基准缩放、技能表合法
check(/init_from/.test(npcSrc) && /sws_base/.test(npcSrc), '守护者按玩家进本基准(sws_base)缩放');
check(/skills_def/.test(npcSrc), '守护者带分级技能表');
const skillIds = collectSkillIds(path.join(root, 'world', 'skill'));
const refIds = [...npcSrc.matchAll(/\["([a-z0-9_]+)",\s*\d+/g)].map(m => m[1]);
const badRefs = refIds.filter(id => !skillIds[id]);
check(refIds.length >= 30, '技能表引用完整（' + refIds.length + ' 条）');
check(badRefs.length === 0, '技能表引用全部存在' + (badRefs.length ? '，缺失: ' + badRefs.join(',') : ''));

// 6. 山外之意词条池：属性键必须在 PROPERTIES 中登记，数值符合设计（速5/暴3/其余5）
const buffBlock = areaSrc.slice(areaSrc.indexOf('var BUFFS'), areaSrc.indexOf('SWS_COLORS'));
const buffProps = [...buffBlock.matchAll(/prop:\s*"([a-z0-9_]+)"/g)].map(m => m[1]);
check(buffProps.length === 10, '山外之意共 10 项（实际 ' + buffProps.length + '）');
const missingProps = buffProps.filter(p => !new RegExp('\\b' + p + '\\b').test(constSrc));
check(missingProps.length === 0, '词条属性均在 PROPERTIES 登记' + (missingProps.length ? '，缺失: ' + missingProps.join(',') : ''));
check(/val:\s*3/.test(buffBlock) && /tag:\s*"暴"/.test(buffBlock), '暴击词条为 +3');
const val5 = (buffBlock.match(/val:\s*5/g) || []).length;
check(val5 === 9, '其余 9 项词条均为 +5（实际 ' + val5 + '）');

// 7. 出口文案静态化，避免层数串显
check(/exitsto_roomjson/.test(cengSrc) && /exitsto_roomjson/.test(ceng2Src), '出口按钮文案静态化');

if (failed) {
    console.error('== 山外山校验未通过：%d 项 ==', failed);
    process.exit(1);
}
console.log('== 山外山校验全部通过 ==');
