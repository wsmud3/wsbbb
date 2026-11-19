// 回归测试：免伤/破防/终伤软上限（技能+装备部分超过 80 递减、永不超过 100；buff 不递减；只对玩家生效）。
// 运行：node tools/test_soft_cap.js
const assert = require("assert");

function CHARACTER() {}
global.CHARACTER = CHARACTER;
// 只执行原型定义，不加载引擎其他模块（文件头的 require 换成空函数）
new Function("CHARACTER", "require", require("fs").readFileSync(require("path").join(__dirname, "../os/char/chara_prop.js"), "utf8"))(CHARACTER, () => ({}));

const cap = CHARACTER.soft_cap;
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.05, msg + "：期望约 " + b + "，实际 " + a);

// 曲线
assert.strictEqual(cap(50), 50, "80 以下不变");
assert.strictEqual(cap(80), 80, "80 处不变");
assert.strictEqual(cap(-20), -20, "负值不变");
near(cap(90), 87.87, "90");
near(cap(100), 92.64, "100");
near(cap(120), 97.29, "120");
near(cap(150), 99.39, "150");
assert.ok(cap(100000) <= 100, "技能+装备再高也不超过 100");
for (let v = 80; v < 300; v += 0.5) {
    assert.ok(cap(v + 0.5) >= cap(v), "单调不减");
    assert.ok(cap(v + 0.5) - cap(v) <= 0.5 + 1e-9, "超过 80 后每点收益不超过 1");
}

function char(isPlayer, base, buff) {
    const c = new CHARACTER();
    c.soft_cap_props = isPlayer;
    c.prop = {}; c.buff_prop = {};
    for (const k in base) c.prop[k] = (c.prop[k] || 0) + base[k];
    for (const k in buff) { c.prop[k] = (c.prop[k] || 0) + buff[k]; c.buff_prop[k] = buff[k]; }
    return c;
}

// 玩家：技能+装备 120 免伤，不开 buff → 约 97.3，不到 100
{ const p = char(true, { diff_sh_per: 120 }, {});
  near(p.query_soft_prop("diff_sh_per"), 97.29, "120 免伤（无 buff）"); }
// 玩家：技能+装备 120 + buff 30 → 97.3 + 30，buff 部分不递减，可超过 100
{ const p = char(true, { diff_sh_per: 120 }, { diff_sh_per: 30 });
  near(p.query_soft_prop("diff_sh_per"), 127.29, "120 免伤 + 30 buff"); }
// 玩家：技能+装备 60 + buff 50 → 110（基础未过 80，不衰减）
{ const p = char(true, { diff_sh_per: 60 }, { diff_sh_per: 50 });
  assert.strictEqual(p.query_soft_prop("diff_sh_per"), 110, "基础 60 + buff 50"); }
// 负面状态（buff_prop 为负）不影响基础部分的折算
{ const p = char(true, { diff_sh_per: 100 }, { diff_sh_per: -40 });
  near(p.query_soft_prop("diff_sh_per"), 52.64, "基础 100 + 减益 -40"); }
// 破防、终伤同理
{ const p = char(true, { diff_fy_per: 120, add_sh_per: 100 }, {});
  near(p.query_soft_prop("diff_fy_per"), 97.29, "破防");
  near(p.query_soft_prop("add_sh_per"), 92.64, "终伤"); }
// 其他属性不受影响
{ const p = char(true, { gj_per: 300 }, {});
  assert.strictEqual(p.query_soft_prop("gj_per"), 300, "非这三项不折算"); }
// NPC 不受影响
{ const n = char(false, { diff_sh_per: 120 }, {});
  assert.strictEqual(n.query_soft_prop("diff_sh_per"), 120, "NPC 不折算"); }

console.log("免伤/破防/终伤软上限测试通过");
