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
const userSrc = read('os/char/user.js');
const itemSrc = read('os/item.js');
const constSrc = read('os/const.js');

// 2. 区域注册与入口
check(/sws:\s*10/.test(jhSrc), 'jh.js 禁地表注册 sws:10');
check(/jd_index:\s*10/.test(areaSrc), 'area 定义 jd_index:10');
check(/id:\s*"sws"/.test(areaSrc), 'area 定义 id:sws');
check(/is_copy:\s*true/.test(areaSrc) && /not_fb:\s*true/.test(areaSrc), 'area 为独立副本（is_copy + not_fb）');
check(/宗师/.test(areaSrc), '入口校验包含宗师境界提示');
check(/_sws_orig_check_unlock/.test(userExtSrc), 'user.js 挂载宗师自动解锁补丁');
check(/SWS_JD_INDEX\s*=\s*10/.test(userExtSrc), '解锁补丁使用禁地位 10');
check(/this\.temp\.sws_base\s*=\s*null/.test(userSrc) && /swsTransient/.test(userSrc), '登录时清理旧版山外山临时状态');
check(/Object\.prototype\.hasOwnProperty\.call\(v, "v"\)/.test(itemSrc) && /JSON\.stringify\(v\)/.test(itemSrc), '临时对象使用安全 JSON 序列化');

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

// 5. 守护者：固定数值成长、动态技能池可覆盖各档位、红装路径真实存在
check(/init_from/.test(npcSrc), '守护者带 init_from 初始化');
check(/BASE_FIVE\s*=\s*10000/.test(npcSrc) && /BASE_HP\s*=\s*100000/.test(npcSrc), '守护者固定成长基准（五维1万/气血10万）');
check(/diff_fy_per/.test(npcSrc) && /add_sh_per/.test(npcSrc) && /diff_sh_per/.test(npcSrc), '守护者带破防/终伤/伤害减免成长');
check(/SH_PER_CAP\s*=\s*80/.test(npcSrc), '伤害减免封顶80%（防高层数完全免疫）');
check(/SKILL_TIERS/.test(npcSrc) && /pick_skill/.test(npcSrc) && /SKILL\[base\]/.test(npcSrc), '技能组按层数换挡（运行时技能池）');
check(!/sws_base/.test(npcSrc), '守护者不再按玩家基准缩放');

// 5.1 技能池静态扫描：各档位战斗技能与内功池必须非空（grade=品级：1绿2蓝3黄4紫5橙6红）
function collectSkillPools(dir, out) {
    out = out || {};
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) collectSkillPools(full, out);
        else if (name.endsWith('.js')) {
            const src = fs.readFileSync(full, 'utf8');
            const grade = parseInt((src.match(/this\.grade\s*=\s*(\d+)/) || [])[1]);
            const en = src.match(/this\.can_enables\s*=\s*\[([^\]]*)\]/);
            if (!grade || !en) continue;
            for (const m of en[1].matchAll(/"([a-z]+)"/g)) {
                const b = m[1];
                if (!out[b]) out[b] = {};
                out[b][grade] = (out[b][grade] || 0) + 1;
            }
        }
    }
    return out;
}
const pools = collectSkillPools(path.join(root, 'world', 'skill'));
const needPools = [
    ['sword', 1], ['unarmed', 1], ['parry', 1], ['dodge', 1], ['force', 1],
    ['sword', 2], ['unarmed', 2], ['parry', 2], ['dodge', 2], ['force', 3],
    ['sword', 3], ['unarmed', 3], ['parry', 3], ['dodge', 3], ['force', 4],
    ['sword', 4], ['unarmed', 4], ['parry', 4], ['dodge', 4], ['force', 5],
    ['sword', 5], ['unarmed', 5], ['parry', 5], ['dodge', 5], ['force', 6],
    ['sword', 6], ['blade', 6],
];
const emptyPools = needPools.filter(([b, g]) => !((pools[b] || {})[g]));
check(emptyPools.length === 0, '各档位技能池全部非空' + (emptyPools.length ? '，空池: ' + emptyPools.map(p => p.join('/')).join(',') : ''));

// 5.2 红武/红装路径必须真实存在（守护者 5000 层起穿戴）
const objPaths = [...new Set([...npcSrc.matchAll(/"(eq\/lv6\/[a-z0-9_\/]+)"/g)].map(m => m[1]))];
const missingObjs = objPaths.filter(p => !fs.existsSync(path.join(root, 'world/obj', p + '.js')));
check(objPaths.length >= 20, '红武/红装池非空（' + objPaths.length + ' 件）');
check(missingObjs.length === 0, '红武/红装路径全部存在' + (missingObjs.length ? '，缺失: ' + missingObjs.join(',') : ''));

// 5.3 奖励方案：每层玄晶1000×层数；每10层残页+元晶；每100层神魂/神器碎片
check(/1000 \* layer/.test(areaSrc) && /st\/xuanjing/.test(areaSrc), '每层玄晶 1000×层数');
check(/book\/wd/.test(areaSrc) && /st\/yuanjing/.test(areaSrc) && /layer % 10 === 0/.test(areaSrc), '每 10 层奖励 20 武道残页 + 1 元晶');
check(/shenhunsuipian/.test(areaSrc) && /shenqisuipian/.test(areaSrc) && /layer % 100 === 0/.test(areaSrc), '每 100 层奖励 5 神魂碎片 + 5 神器碎片');
check(!/set_temp\("sws_base"/.test(areaSrc), '不再创建山外山基准快照（登录迁移负责清理旧快照）');

// 6. 山外之意词条池：属性键必须在 PROPERTIES 中登记，数值符合设计（速5/暴3/其余5）
const buffBlock = areaSrc.slice(areaSrc.indexOf('var BUFFS'), areaSrc.indexOf('==== 江湖入口'));
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
