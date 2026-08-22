const assert = require("assert");
global.WORLD = { COMMANDS: {} };
require("../world/zhenyi.js");

function player() {
    const temp = { wd100: 1, zy_jz_1: 1, zy_active_jz: 1, zy_mat_jz_1: 9, zy_zw_1: 1, zy_mat_zw_1: 9 };
    const bits = {};
    return {
        family: { id: "HUASHAN" }, level: 5, temp, bits, items: [], commands: [], messages: [],
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

me.level = 4;
assert.strictEqual(WORLD.ZHENYI.get_active(me), null, "未到武帝时真意不得生效");
assert.strictEqual(WORLD.ZHENYI.is_allowed_skill({ grade: 6, family: me.family }, me), false, "grade 6 必须被运行时拦截");
assert.strictEqual(WORLD.ZHENYI.is_allowed_skill({ grade: 5, family: { id: "HUASHAN" } }, me), false, "非同一门派对象不得被强化");
assert.strictEqual(WORLD.ZHENYI.is_allowed_skill({ grade: 5, family: me.family }, me), true, "本门非红技能可受强化");

console.log("真意逻辑通过：旧角色补发、悟痕道具迁移、二次确认升级、grade 成长、异门清理与 grade 6 技能拦截均正常。");
