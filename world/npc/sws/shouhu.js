// 山外山守护者：固定数值成长（不再按挑战者基准缩放），层数没有上限。
// 五维（攻击/命中/招架/躲闪/防御）初始 1 万、气血初始 10 万，每层 +1%；
// 每 10 层 +1% 破防（忽视防御）与终伤，每 15 层 +1% 伤害减免（封顶 80%，
// 因为核心 damage() 对 >=100% 减免会完全免疫，见 world/extends/char/combat.js）。
// 技能组按层数换挡（动态取自运行时注册表 SKILL[base][grade]，品级即颜色：1绿2蓝3黄4紫5橙6红）：
//   <1000    绿色技能 + 绿色内功
//   1000-1999 蓝色技能 + 黄色内功
//   2000-2999 黄色技能 + 紫色内功
//   3000-3999 紫色技能 + 橙色内功
//   4000+    橙色技能 + 红色内功 + 随机一个红色武器技能（占用武器槽位）
// 5000 层起守护者装备随机红色武器，并每多 200 层多穿 1 件非武器红装（上限 9 个槽位）。
this.inherits(NPC);
this.set({
    name: "",
    desc: "山外山的守护者，身形隐在山岚之中，唯有一双眼睛亮如寒星。",
    title: "山外山守护者",
    gender: 1,
    age: 30,
    per: this.random(44),
    mp: 400,
    max_mp: 400,
    hp: 400,
    max_hp: 400,
    no_refresh: true,
    no_fight: true
});

var SWS_COLORS = ["hig", "hic", "hiy", "hiz", "hio", "ord", "hir"];

// ============ 固定成长参数 ============
var BASE_FIVE = 10000;   // 攻击/命中/招架/躲闪/防御 初始值
var BASE_HP = 100000;    // 气血 初始值
var SH_PER_CAP = 80;     // 伤害减免上限（%）

// 层数 → 技能档位（combat=战斗技能品级，force=内功品级，level=技能等级）
var SKILL_TIERS = [
    { min: 1, combat: 1, force: 1, level: 500 },    // <1000    绿
    { min: 1000, combat: 2, force: 3, level: 800 },   // 1000-1999 蓝 + 黄内功
    { min: 2000, combat: 3, force: 4, level: 1100 },  // 2000-2999 黄 + 紫内功
    { min: 3000, combat: 4, force: 5, level: 1500 },  // 3000-3999 紫 + 橙内功
    { min: 4000, combat: 5, force: 6, level: 1900 },  // 4000+    橙 + 红内功 + 红武技
    { min: 5000, combat: 5, force: 6, level: 2400 },  // 5000+    同上 + 红装
];

// 5000 层起随机红色武器（限定存在 grade6 武器技能的类型：sword/blade）
var RED_WEAPONS = [
    { path: "eq/lv6/wushen/xuanyuan_sword", base: "sword" },
    { path: "eq/lv6/wushen/taisui_sword", base: "sword" },
    { path: "eq/lv6/wushen/fuyu_sword", base: "sword" },
    { path: "eq/lv6/modao", base: "blade" },
    { path: "eq/lv6/wushen/yinghuo_blade", base: "blade" },
    { path: "eq/lv6/wushen/ying_blade", base: "blade" },
    { path: "eq/lv6/wushen/dihou_axe", base: "blade" },
    { path: "eq/lv6/wushen/pangu_axe", base: "blade" },
];

// 非武器红装，按装备槽位分组（同槽随机取一件）
var RED_GEAR_SLOTS = [
    ["eq/lv6/wushen/taiji_cloth", "eq/lv6/wushen/zhanshenjia"],                      // 衣服
    ["eq/lv6/wushen/haotian_shoes"],                                               // 鞋
    ["eq/lv6/wushen/jinding_head"],                                                // 头
    ["eq/lv6/wushen/jinlan_cape"],                                                 // 披风
    ["eq/lv6/wushen/qibao_ring", "eq/lv6/wushen/zaohua"],                          // 戒指
    ["eq/lv6/wushen/xuanji_necklace"],                                             // 项链
    ["eq/lv6/wushen/nvwa_jewels", "eq/lv6/wushen/shennong_jewels",
        "eq/lv6/wushen/weizhang_jewels", "eq/lv6/wushen/chiyouzhixue"],            // 饰品
    ["eq/lv6/wushen/zhuque_wrist"],                                                // 护腕
    ["eq/lv6/wushen/fushen_waist"],                                                // 腰带
];

// 从运行时注册表 SKILL[base][grade] 随机取一门技能（排除自创/隐藏；空池向低品级回退）
function pick_skill(base, grade) {
    for (var g = grade; g >= 1; g--) {
        var pool = SKILL[base] && SKILL[base][g];
        if (!pool) continue;
        var candidates = [];
        for (var i = 0; i < pool.length; i++) {
            var s = pool[i];
            if (!s || s.is_custom || s.is_hidden) continue;
            candidates.push(s.id);
        }
        if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];
    }
    return null;
}

function pick_random(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// player 参数仅为兼容旧调用签名保留，固定成长不再依赖挑战者属性
this.init_from = function (player, layer) {
    this.con = this.dex = this.int = this.str = 100 + layer * 20;
    this.name = UTIL.random_name(this.gender);
    var tier = parseInt((layer - 1) / 5);
    if (tier > SWS_COLORS.length - 1) tier = SWS_COLORS.length - 1;
    var color = SWS_COLORS[tier];
    this.title = "<" + color + ">山外山·第" + UTIL.to_c(layer) + "层守护者</" + color + ">";

    // —— 技能组换挡 ——
    var skTier = SKILL_TIERS[0];
    for (var ti = SKILL_TIERS.length - 1; ti >= 0; ti--) {
        if (layer >= SKILL_TIERS[ti].min) {
            skTier = SKILL_TIERS[ti];
            break;
        }
    }
    var lvl = skTier.level;
    var bases = ["force", "unarmed", "sword", "parry", "dodge"];
    var defs = [];
    for (var bi = 0; bi < bases.length; bi++) {
        defs.push([bases[bi], lvl]);
        var grade = bases[bi] === "force" ? skTier.force : skTier.combat;
        var skid = pick_skill(bases[bi], grade);
        if (skid) defs.push([skid, lvl, bases[bi]]);
    }

    // —— 4000+：随机红色武器技能（与所持武器类型一致才会被用于攻击） ——
    if (skTier.min >= 4000) {
        var redBase = "sword"; // 5000 层前仍持 lv0 长剑
        if (layer >= 5000) {
            var wpn = pick_random(RED_WEAPONS);
            redBase = wpn.base;
            this.set_objects([wpn.path, 1, 1]);
        }
        var redSkid = pick_skill(redBase, 6);
        if (redSkid) defs.push([redSkid, lvl, redBase]);
    }
    this.skill_map.apply(this, defs);

    // —— 装备：5000 层前布衣长剑；5000 层起红武 + 非武器红装（每 200 层 +1 件） ——
    if (layer >= 5000) {
        this.set_objects(["eq/lv0/cloth", 1, 1]);
        var count = 1 + parseInt((layer - 5000) / 200);
        if (count > RED_GEAR_SLOTS.length) count = RED_GEAR_SLOTS.length;
        var slots = RED_GEAR_SLOTS.slice();
        for (var si = slots.length - 1; si > 0; si--) {
            var sj = Math.floor(Math.random() * (si + 1));
            var tmp = slots[si];
            slots[si] = slots[sj];
            slots[sj] = tmp;
        }
        for (var gi = 0; gi < count; gi++) {
            this.set_objects([pick_random(slots[gi]), 1, 1]);
        }
        // NPC 直装不走 eq()，query_prop 只读 prop，需手动并入装备数值属性
        //（武器 do_attack、防具 on_defense 等特效由引擎自动触发，无需处理）
        this.apply_equipment_props();
    } else {
        this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
    }

    // —— 层数百分比：破防/终伤每 10 层 +1%，伤害减免每 15 层 +1%（封顶） ——
    this.add_prop("diff_fy_per", parseInt((layer - 1) / 10));
    this.add_prop("add_sh_per", parseInt((layer - 1) / 10));
    var diffSh = parseInt((layer - 1) / 15);
    if (diffSh > SH_PER_CAP) diffSh = SH_PER_CAP;
    this.add_prop("diff_sh_per", diffSh);

    this.init();
    this.recount();

    // —— 固定数值成长：每层 +1% ——
    var grow = 1 + (layer - 1) / 100;
    this.max_hp = this.hp = parseInt(BASE_HP * grow);
    this.max_mp = this.mp = parseInt(this.max_hp / 2);
    this.gj = parseInt(BASE_FIVE * grow);
    this.fy = parseInt(BASE_FIVE * grow);
    this.mz = parseInt(BASE_FIVE * grow);
    this.ds = parseInt(BASE_FIVE * grow);
    this.zj = parseInt(BASE_FIVE * grow);
    this.bj = parseInt(layer / 4);
    if (this.bj > 45) this.bj = 45;
};

// 把已装备的数值属性并入 prop（跳过描述文本与非数值词条）
this.apply_equipment_props = function () {
    if (!this.equipment) return;
    for (var i = 0; i < this.equipment.length; i++) {
        var eq = this.equipment[i];
        if (!eq || !eq.prop) continue;
        for (var key in eq.prop) {
            if (key === "desc") continue;
            var val = eq.prop[key];
            if (typeof val !== "number") continue;
            this.add_prop(key, val);
        }
    }
};
