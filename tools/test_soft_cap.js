// 回归测试：免伤/破防/终伤软上限（技能+装备部分超过 80 按 80+2√(x-80) 递减、封顶 99.9999；buff 不递减；只对玩家生效）。
// 运行：node tools/test_soft_cap.js
const assert = require("assert");
const fs = require("fs");
const path = require("path");

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
near(cap(81), 82, "81（与比武旧曲线一致）");
near(cap(90), 86.32, "90");
near(cap(100), 88.94, "100");
near(cap(120), 92.65, "120");
near(cap(150), 96.73, "150");
assert.strictEqual(cap(180), 99.9999, "180 封顶");
assert.strictEqual(cap(100000), 99.9999, "技能+装备再高也不到 100");
for (let v = 80; v < 300; v += 0.5) {
    assert.ok(cap(v + 0.5) >= cap(v), "单调不减");
}

function char(isPlayer, base, buff) {
    const c = new CHARACTER();
    c.soft_cap_props = isPlayer;
    c.prop = {}; c.buff_prop = {};
    for (const k in base) c.prop[k] = (c.prop[k] || 0) + base[k];
    for (const k in buff) { c.prop[k] = (c.prop[k] || 0) + buff[k]; c.buff_prop[k] = buff[k]; }
    return c;
}

// 普通免伤/破防/终伤不分来源全部折算（技能、装备、buff、减益都算进同一个合计）
{ const p = char(true, { diff_sh_per: 120 }, {});
  near(p.query_soft_prop("diff_sh_per"), 92.65, "120 普通免伤"); }
// 兜底：buff 带来的正值普通免伤视同特殊免伤，不折算
{ const p = char(true, { diff_sh_per: 120 }, { diff_sh_per: 30 });
  near(p.query_soft_prop("diff_sh_per"), 122.65, "buff 免伤不折算"); }
{ const p = char(true, { diff_sh_per: 100 }, { diff_sh_per: -40 });
  assert.strictEqual(p.query_soft_prop("diff_sh_per"), 60, "减益先抵扣再折算"); }
{ const p = char(true, { diff_fy_per: 100, add_sh_per: 100 }, { diff_fy_per: 20, add_sh_per: 50 });
  near(p.query_soft_prop("diff_fy_per"), 92.65, "破防含 buff 全部折算");
  near(p.query_soft_prop("add_sh_per"), 96.73, "终伤含 buff 全部折算"); }
{ const p = char(true, { diff_fy_per: 100 }, { diff_fy_per2: 20 });
  near(p.query_soft_prop("diff_fy_per"), 92.65, "diff_fy_per2 并入破防折算"); }
// 其他属性不受影响
{ const p = char(true, { gj_per: 300 }, {});
  assert.strictEqual(p.query_soft_prop("gj_per"), 300, "非这三项不折算"); }
// NPC 不受影响
{ const n = char(false, { diff_sh_per: 120, diff_fy_per: 150 }, {});
  assert.strictEqual(n.query_soft_prop("diff_sh_per"), 120, "NPC 免伤不折算");
  assert.strictEqual(n.query_soft_prop("diff_fy_per"), 150, "NPC 破防不折算"); }

const read = f => fs.readFileSync(path.join(__dirname, "..", f), "utf8");
// 玩家与擂台镜像：免伤 = 软上限(普通免伤) + 特殊免伤 diff_sh_per2
for (const f of ["world/extends/char/user.js", "world/cmd/extend/biwu.js"]) {
  const src = read(f);
  assert.ok(/diff_sh_per = this\.query_soft_prop\('diff_sh_per'\) \+ this\.query_prop\('diff_sh_per2'\)/.test(src), f + "：免伤 = 软上限 + diff_sh_per2");
  assert.ok(/diff_fy_per = this\.query_soft_prop\('diff_fy_per'\);/.test(src), f + "：破防走软上限");
}
assert.ok(/npc\.soft_cap_props = true/.test(read("world/cmd/extend/biwu.js")), "擂台镜像按玩家规则折算");
assert.ok(/buff_prop\.diff_sh_per2/.test(read("world/extends/char/combat.js")), "NPC 施放的特殊免伤 buff 仍生效");

// 免伤类 buff 一律给特殊免伤：自身 add_status 里不应再出现正值普通免伤
// （大品天仙诀、逆仙魔诀、天地棋盘、掌中之国已删除）
const buffSkills = ["world/skill/dodge/xuanxubu.js", "world/skill/force/changshengjue.js",
  "world/skill/force/yinyangjiuzhuan.js",
  "world/skill/force/hamagong.js", "world/skill/force/jiuyangshengong.js", "world/skill/force/wunianchangong.js",
  "world/skill/force/tianmoce.js", "world/obj/drug/yao.js"];
for (const f of buffSkills) assert.ok(/diff_sh_per2/.test(read(f)), f + "：免伤 buff 应为 diff_sh_per2");

console.log("免伤/破防/终伤软上限测试通过");
