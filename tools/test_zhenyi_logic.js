const assert = require("assert");
global.WORLD = {};
require("../world/zhenyi.js");

function player() {
    const temp = { wd100: 1, zy_jz_1: 1, zy_active_jz: 1, zy_zw_1: 1, zy_mat_zw_1: 9 };
    const bits = {};
    return {
        family: { id: "HUASHAN" }, level: 5, temp, bits,
        query_temp(key, def) { return this.temp[key] === undefined ? def : this.temp[key]; },
        set_temp(key, value) { this.temp[key] = value; return value; },
        add_temp(key, value) { this.temp[key] = (this.temp[key] || 0) + value; return this.temp[key]; },
        remove_temp(key) { delete this.temp[key]; },
        query_bool(key, bit) { return !!((this.bits[key] || 0) & (1 << bit)); },
        set_bool(key, bit, value) { this.bits[key] = value ? ((this.bits[key] || 0) | (1 << bit)) : ((this.bits[key] || 0) & ~(1 << bit)); },
        is_fighting() { return false; }, notify() {}, send() {}
    };
}

const me = player();
assert.strictEqual(WORLD.ZHENYI.check_unlock(me, true), true, "旧角色应补发禁地权限");
assert.strictEqual(me.query_bool("fb2", 2), true, "应解锁华山禁地位");
assert.strictEqual(me.query_temp("zy_level_jz_1", 0), 1, "旧真意应迁移为一重");
assert.strictEqual(me.query_temp("zy_active", ""), "jz_1", "旧位掩码应迁移为唯一启用项");
assert.strictEqual(me.query_temp("zy_zw_1", 0), 0, "更新前异门真意应被清理");
assert.strictEqual(me.query_temp("zy_mat_zw_1", 0), 0, "更新前异门悟痕应被清理");
assert.strictEqual(WORLD.ZHENYI.get_active(me).intent.id, 1, "满足条件时真意应生效");

me.level = 4;
assert.strictEqual(WORLD.ZHENYI.get_active(me), null, "未到武帝时真意不得生效");
assert.strictEqual(WORLD.ZHENYI.is_allowed_skill({ grade: 6, family: me.family }, me), false, "grade 6 必须被运行时拦截");
assert.strictEqual(WORLD.ZHENYI.is_allowed_skill({ grade: 5, family: { id: "HUASHAN" } }, me), false, "非同一门派对象不得被强化");
assert.strictEqual(WORLD.ZHENYI.is_allowed_skill({ grade: 5, family: me.family }, me), true, "本门非红技能可受强化");

console.log("真意逻辑通过：旧角色解锁、旧数据迁移、异门清理、武帝门槛与 grade 6 拦截均正常。");
