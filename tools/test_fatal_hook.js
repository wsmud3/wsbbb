// 回归测试：致命一击免死钩子（CHARACTER.add_hp → 装备 on_fatal），以及宝物璇玑按说明自动触发。
// 运行：node tools/test_fatal_hook.js
const assert = require("assert");
const fs = require("fs");
const path = require("path");

function CHARACTER() {}
global.CHARACTER = CHARACTER;
new Function("CHARACTER", "require", fs.readFileSync(path.join(__dirname, "../os/char/combat.js"), "utf8"))(CHARACTER, () => ({}));

// 模拟璇玑：只加载其 on_fatal（文件头的 inherits/set 换成空操作）
const xuanji = { inherits() {}, set(o) { Object.assign(this, o); } };
new Function("EQUIPMENT", "EQUIP_TYPE", fs.readFileSync(path.join(__dirname, "../world/obj/eq/lv6/wushen/xuanji_necklace.js"), "utf8"))
    .call(xuanji, {}, { NECKLACE: 5 });
assert.strictEqual(typeof xuanji.on_fatal, "function", "璇玑应为致命一击自动触发");
assert.ok(!xuanji.is_shortcut && !xuanji.on_use, "璇玑不再是手动使用");

function mk(eqs) {
    const c = new CHARACTER();
    c.hp = 1000; c.max_hp = 1000; c.equipment = eqs; c.temp = {}; c.statuses = [];
    c.notify_hp = () => {};
    c.query_temp = function (k) { return this.temp[k]; };
    c.set_temp = function (k, v) { this.temp[k] = v; };
    c.add_status = function (s) { this.statuses.push(s.id); };
    return c;
}
// 无装备：照常扣到 0
{ const c = mk([]); c.add_hp(-5000); assert.strictEqual(c.hp, 0, "无免死装备照常死亡"); }
// 非致命：不触发
{ const c = mk([xuanji]); c.add_hp(-500); assert.strictEqual(c.hp, 500); assert.strictEqual(c.statuses.length, 0, "非致命不触发"); }
// 致命：留 1 血 + 护体 + 冷却
{ const c = mk([null, xuanji]); c.add_hp(-5000);
  assert.strictEqual(c.hp, 1, "致命一击保留 1 点气血");
  assert.deepStrictEqual(c.statuses, ["wushen_xuanji"], "获得璇玑护体");
  assert.ok(c.temp.wushen_xuanji_cd, "进入冷却");
  c.add_hp(-5000); assert.strictEqual(c.hp, 0, "冷却中不再触发"); }
// 比试（fight_type 1）不会死，不触发；被下杀手（fight_type 2）照常触发
{ const c = mk([xuanji]); c.fight_type = 1; c.add_hp(-5000);
  assert.strictEqual(c.statuses.length, 0, "比试中不触发"); assert.ok(!c.temp.wushen_xuanji_cd, "比试不消耗冷却");
  c.hp = 1000; c.fight_type = 2; c.add_hp(-5000); assert.strictEqual(c.hp, 1, "比试中被下杀手照常触发"); }
// 已经 0 血时不触发
{ const c = mk([xuanji]); c.hp = 0; c.add_hp(-10); assert.strictEqual(c.statuses.length, 0); }

console.log("致命一击免死钩子测试通过");
