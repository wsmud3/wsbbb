const assert = require("assert");
global.WORLD = { COMMANDS: {} };
require("../world/zhenyi.js");

function player() {
    const temp = { wd100: 1, zy_jz_1: 1, zy_active_jz: 1, zy_mat_jz_1: 9, zy_zw_1: 1, zy_mat_zw_1: 9 };
    const bits = {};
    return {
        id: "tester", family: { id: "HUASHAN" }, level: 5, temp, bits, items: [], commands: [], messages: [],
        query_temp(key, def) { return this.temp[key] === undefined ? def : this.temp[key]; },
        set_temp(key, value) { this.temp[key] = value; return value; },
        add_temp(key, value) { this.temp[key] = (this.temp[key] || 0) + value; return this.temp[key]; },
        remove_temp(key) { delete this.temp[key]; },
        query_bool(key, bit) { return !!((this.bits[key] || 0) & (1 << bit)); },
        set_bool(key, bit, value) { this.bits[key] = value ? ((this.bits[key] || 0) | (1 << bit)) : ((this.bits[key] || 0) & ~(1 << bit)); },
        is_fighting() { return false; },
        notify(msg) { this.messages.push(msg); }, send() {},
        send_commands(...args) { this.commands.push(args); },
        find_obj_bypath(path) { return this.items.find(item => item.path === path); },
        add_obj(path, count = 1) {
            let item = this.find_obj_bypath(path);
            if (item) item.count += count;
            else { item = { path, count }; this.items.push(item); }
            return item;
        },
        remove_obj(item, count) {
            if (!item || item.count < count) return null;
            const removed = { path: item.path, count };
            item.count -= count;
            if (!item.count) this.items.splice(this.items.indexOf(item), 1);
            return removed;
        }
    };
}

const me = player();
assert.strictEqual(WORLD.ZHENYI.check_unlock(me, true), true, "旧角色应补发禁地权限");
assert.strictEqual(me.query_bool("fb2", 2), true, "应解锁华山禁地位");
assert.strictEqual(me.query_temp("zy_level_jz_1", 0), 1, "旧真意应迁移为一重");
assert.strictEqual(me.query_temp("zy_active", ""), "jz_1", "旧位掩码应迁移为唯一启用项");
assert.strictEqual(me.query_temp("zy_zw_1", 0), 0, "更新前异门真意应被清理");
assert.strictEqual(me.query_temp("zy_mat_zw_1", 0), 0, "更新前异门悟痕应被清理");
assert.strictEqual(me.query_temp("zy_mat_jz_1", 0), 0, "旧版计数悟痕应完成迁移");
assert.strictEqual(me.find_obj_bypath("st/zhenyi_hen#jz_1").count, 9, "悟痕必须迁移为背包道具");
assert.strictEqual(WORLD.ZHENYI.get_active(me).intent.id, 1, "满足条件时真意应生效");
assert.deepStrictEqual([0, 1, 2, 4, 6, 8, 10].map(WORLD.ZHENYI.grade_for_level), [0, 1, 2, 3, 4, 5, 6], "真意重数应覆盖游戏 grade 0～6");

me.add_obj("st/xuanjing", 100);
const messageCountBeforeUpgrade = me.messages.length;
assert.strictEqual(WORLD.ZHENYI.request_upgrade(me, 1), true, "点击升级应先生成确认步骤");
assert.strictEqual(me.query_temp("zy_level_jz_1", 0), 1, "确认前不得直接升级");
assert.ok(me.commands.some(items => items[0] === "zhenyi upgrade_confirm 1 1"), "主消息页应出现确认升级命令");
assert.ok(!me.messages.slice(messageCountBeforeUpgrade).some(message => /grade|品质/.test(message)), "玩家可见的升级确认不得暴露内部 grade 或品质说明");
assert.strictEqual(WORLD.ZHENYI.confirm_upgrade(me, 1, 1), true, "确认后才执行升级");
assert.strictEqual(me.query_temp("zy_level_jz_1", 0), 2, "真意应升到第二重");
assert.strictEqual(WORLD.ZHENYI.serialize(me).list[0].grade, 2, "第二重应进入青色 grade 2");
assert.ok(!/[约～]/.test(WORLD.ZHENYI.serialize(me).list[0].desc), "面板效果不得使用约数或范围措辞");

for (const data of Object.values(WORLD.ZHENYI.DATA)) {
    for (const intent of data.list) {
        for (let level = 1; level <= 10; level++) {
            const values = WORLD.ZHENYI.values_for(data, intent, level);
            for (const value of Object.values(values)) assert.ok(Number.isInteger(value), `${data.key}_${intent.id} 第${level}重存在非整数效果`);
            const desc = WORLD.ZHENYI.describe(data, intent, level);
            assert.ok(!/\d+\.\d+/.test(desc), `${data.key}_${intent.id} 第${level}重描述出现小数`);
            if (values.ignore) assert.ok(desc.includes(`${values.ignore}%`) && !desc.includes("点破防"), "忽视防御必须以准确百分比显示");
        }
    }
}

const firstTrial = WORLD.ZHENYI.trial_stats(WORLD.ZHENYI.DATA.HUASHAN.list[0]);
const finalTrial = WORLD.ZHENYI.trial_stats(WORLD.ZHENYI.DATA.HUASHAN.list[4]);
assert.deepStrictEqual([firstTrial.max_hp, firstTrial.gj, firstTrial.skill], [12000000, 140000, 2500], "第一档试炼应沿用旧 NPC 起步数值");
assert.deepStrictEqual([finalTrial.max_hp, finalTrial.gj, finalTrial.skill], [30000000, 250000, 3000], "第五档试炼应沿用旧 NPC 后段数值");
assert.strictEqual(WORLD.ZHENYI.allow_public_npc("jz/houshan", "jz/jianyi_yeling"), false, "禁地旧 NPC 不应继续生成");
assert.strictEqual(WORLD.ZHENYI.allow_public_npc("jz/houshan", "pub/zhenyi_shiyantai#jz_1"), true, "正式试炼引导 NPC 必须保留");

const combatant = player();
combatant.temp.zy_level_jz_1 = 1;
combatant.temp.zy_active = "jz_1";
combatant.temp.zy_pfm = "jz_edge";
const combatValues = WORLD.ZHENYI.values_for(WORLD.ZHENYI.DATA.HUASHAN, WORLD.ZHENYI.DATA.HUASHAN.list[0], 1);
const combatPar = { diff_fy: 10 };
const modifiedDamage = WORLD.ZHENYI.modify_attack(combatant, { hp: 100, max_hp: 100 }, combatPar, 100, { grade: 5, family: combatant.family });
assert.strictEqual(combatPar.diff_fy, 10 + combatValues.ignore, "忽视防御应按百分比在原值上加算");
assert.strictEqual(modifiedDamage, 100 * (1 + combatValues.damage / 100), "实战伤害必须读取与描述相同的整数百分比");

const stale = player();
stale.temp.zy_trial_active = "jz_1";
stale.temp.zy_trial_owner = "zhenyi_trial:jz:tester";
stale.temp.zy_trial_return = "jz/houshan";
stale.environment = { path: "jz/houshan", owner: "zhenyi_public:jz", parent: { id: "jz" }, items: [] };
assert.strictEqual(WORLD.ZHENYI.ensure_trial_state(stale, true), false, "NPC 已消失的旧试炼状态必须判为失效");
assert.strictEqual(stale.query_temp("zy_trial_active", ""), "", "旧试炼残留必须自动清理");
assert.ok(stale.messages.some(message => message.includes("残留状态已经自动清理")), "应告知玩家可以重新挑战");

me.level = 4;
assert.strictEqual(WORLD.ZHENYI.get_active(me), null, "未到武帝时真意不得生效");
assert.strictEqual(WORLD.ZHENYI.is_allowed_skill({ grade: 6, family: me.family }, me), false, "grade 6 必须被运行时拦截");
assert.strictEqual(WORLD.ZHENYI.is_allowed_skill({ grade: 5, family: { id: "HUASHAN" } }, me), false, "非同一门派对象不得被强化");
assert.strictEqual(WORLD.ZHENYI.is_allowed_skill({ grade: 5, family: me.family }, me), true, "本门非红技能可受强化");

console.log("真意逻辑通过：整数效果、百分比单位、旧角色迁移、残留试炼自愈、固定 NPC 档位、升级确认与技能边界均正常。");
