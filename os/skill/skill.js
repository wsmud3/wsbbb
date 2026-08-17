/*global SKILL_TYPES SKILL BASE PROPERTIES WORLD FAMILIES*/

require("../util/util.js");
SKILL = function () {
    this.id = "";
    this.name = "";
    this.type = SKILL_TYPES.SKILL;
    this.grade = 1;
    this.score = 0;
}
SKILL.inherits(BASE);

// Global advancement slot pool for combat skill position-based advancement (indices < 500)
SKILL.PROPERTIES = [
    // === Position-specific slots ===
    {
        name: "御气之道",
        positions: ["parry", "force", "unarmed", "dodge"],
        prop: "limit_mp",
        count: 1,
        condition: function (grd) { return grd >= 3; },
        value: function (lv, grade) { return lv * 18 * (grade + 1); },
        format: function (val) { return "内力上限：+" + val; }
    },
    {
        name: "轻盈之术",
        positions: ["dodge"],
        prop: "dex",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv * (grade + 1) / 20); },
        format: function (val) { return val > 0 ? "身法：+" + val : "身法：" + val; }
    },
    {
        name: "明悟之术",
        positions: ["parry", "force"],
        prop: "int",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv * (grade + 1) / 20); },
        format: function (val) { return val > 0 ? "悟性：+" + val : "悟性：" + val; }
    },
    {
        name: "永生之道",
        positions: ["force"],
        prop: "age",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv / 200); },
        format: function (val) { return "年龄：-" + val; }
    },
    {
        name: "易容之术",
        positions: ["force"],
        prop: "per",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv / 200); },
        format: function (val) { return val > 0 ? "容貌：+" + val : "容貌：" + val; }
    },
    {
        name: "炼体之术",
        positions: ["parry", "force"],
        prop: "con",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv * (grade + 1) / 20); },
        format: function (val) { return val > 0 ? "根骨：+" + val : "根骨：" + val; }
    },
    {
        name: "守护之道",
        positions: ["force"],
        prop: "diff_sh_per",
        count: 1,
        value: function (lv, grade) { return 2 + Math.floor(lv / 500); },
        format: function (val) { return val > 0 ? "伤害减免：+" + val + "%" : "伤害减免：" + val + "%"; }
    },
    {
        name: "气血之道",
        positions: ["force"],
        prop: "max_hp",
        count: 1,
        value: function (lv, grade) { return lv * 18 * (grade + 1); },
        format: function (val) { return val > 0 ? "气血上限：+" + val : "气血上限：" + val; }
    },
    {
        name: "强体之术",
        positions: ["unarmed", "weapon"],
        prop: "str",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv * (grade + 1) / 20); },
        format: function (val) { return val > 0 ? "臂力：+" + val : "臂力：" + val; }
    },
    {
        name: "残暴之心",
        positions: ["weapon"],
        prop: "bj_per",
        count: 1,
        value: function (lv, grade) { return 3 + Math.floor(lv / 500); },
        format: function (val) { return val > 0 ? "暴击：+" + val + "%" : "暴击：" + val + "%"; }
    },
    {
        name: "天生之道",
        positions: ["unarmed"],
        prop: "add_sh_per",
        count: 1,
        value: function (lv, grade) { return 3 + Math.floor(lv / 500); },
        format: function (val) { return val > 0 ? "最终伤害：+" + val + "%" : "最终伤害：" + val + "%"; }
    },
    // === General slots ===
    {
        name: "防守之道",
        positions: ["parry", "dodge", "unarmed", "weapon"],
        prop: "fy",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv / 100 + 1) * (grade + 1) * 36; },
        format: function (val) { return val > 0 ? "防御：+" + val : "防御：" + val; }
    },
    {
        name: "进攻之道",
        positions: ["parry", "dodge", "unarmed", "weapon"],
        prop: "gj",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv / 100 + 1) * (grade + 1) * 36; },
        format: function (val) { return val > 0 ? "攻击：+" + val : "攻击：" + val; }
    },
    {
        name: "命中之道",
        positions: ["parry", "dodge", "unarmed", "weapon"],
        prop: "mz",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv / 100 + 1) * (grade + 1) * 36; },
        format: function (val) { return val > 0 ? "命中：+" + val : "命中：" + val; }
    },
    {
        name: "招架之道",
        positions: ["parry", "dodge", "unarmed", "weapon"],
        prop: "zj",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv / 100 + 1) * (grade + 1) * 36; },
        format: function (val) { return val > 0 ? "招架：+" + val : "招架：" + val; }
    },
    {
        name: "闪避之道",
        positions: ["parry", "dodge", "unarmed", "weapon"],
        prop: "ds",
        count: 1,
        value: function (lv, grade) { return Math.floor(lv / 100 + 1) * (grade + 1) * 36; },
        format: function (val) { return val > 0 ? "闪避：+" + val : "闪避：" + val; }
    }
];

// ===== 自创技能词条池 (index 500+, 对应 skill.slots[0..21]) =====
// query_slot(i) → this.slots[i-500] → SKILL.ZC_WORDS[i-500]
SKILL.ZC_WORDS = [
    // ===== 基础属性 (category 0) - 固定值 =====
    {
        name: "攻击", category: 0,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "gj", value_type: "flat",
        value: function (lv, grade, word_level) {
            var base = Math.floor(lv / 100 + 1) * (grade + 1) * 36;
            return Math.floor(base * (1 + (word_level || 0) / 15));
        },
        format: function (val) { return "攻击：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "防御", category: 0,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "fy", value_type: "flat",
        value: function (lv, grade, word_level) {
            var base = Math.floor(lv / 100 + 1) * (grade + 1) * 36;
            return Math.floor(base * (1 + (word_level || 0) / 15));
        },
        format: function (val) { return "防御：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "命中", category: 0,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "mz", value_type: "flat",
        value: function (lv, grade, word_level) {
            var base = Math.floor(lv / 100 + 1) * (grade + 1) * 36;
            return Math.floor(base * (1 + (word_level || 0) / 15));
        },
        format: function (val) { return "命中：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "招架", category: 0,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "zj", value_type: "flat",
        value: function (lv, grade, word_level) {
            var base = Math.floor(lv / 100 + 1) * (grade + 1) * 36;
            return Math.floor(base * (1 + (word_level || 0) / 15));
        },
        format: function (val) { return "招架：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "躲闪", category: 0,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "ds", value_type: "flat",
        value: function (lv, grade, word_level) {
            var base = Math.floor(lv / 100 + 1) * (grade + 1) * 36;
            return Math.floor(base * (1 + (word_level || 0) / 15));
        },
        format: function (val) { return "躲闪：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "气血上限", category: 0,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "max_hp", value_type: "flat",
        value: function (lv, grade, word_level) {
            var base = Math.floor(lv / 100 + 1) * (grade + 1) * 36;
            return Math.floor(base * (1 + (word_level || 0) / 15));
        },
        format: function (val) { return "气血上限：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "内力上限", category: 0,
        positions: ["force"],
        prop: "limit_mp", value_type: "flat",
        value: function (lv, grade, word_level) {
            var wl = word_level || 0;
            return Math.floor(lv * (100 + wl * 3));
        },
        format: function (val) { return "内力上限：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    // ===== 后天属性 (category 1) - 固定值 =====
    {
        name: "身法", category: 1,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "dex", value_type: "flat",
        value: function (lv, grade, word_level) {
            var base = (1 + grade * 2) * 80;
            return Math.floor(base * (1 + (word_level || 0) / 15));
        },
        format: function (val) { return "身法：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "悟性", category: 1,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "int", value_type: "flat",
        value: function (lv, grade, word_level) {
            var base = (1 + grade * 2) * 80;
            return Math.floor(base * (1 + (word_level || 0) / 15));
        },
        format: function (val) { return "悟性：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "根骨", category: 1,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "con", value_type: "flat",
        value: function (lv, grade, word_level) {
            var base = (1 + grade * 2) * 80;
            return Math.floor(base * (1 + (word_level || 0) / 15));
        },
        format: function (val) { return "根骨：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "臂力", category: 1,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "str", value_type: "flat",
        value: function (lv, grade, word_level) {
            var base = (1 + grade * 2) * 80;
            return Math.floor(base * (1 + (word_level || 0) / 15));
        },
        format: function (val) { return "臂力：+" + val; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    // ===== 高级属性 (category 2) - 百分比 =====
    {
        name: "攻击%", category: 2,
        positions: ["force", "unarmed", "weapon"],
        prop: "gj_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "攻击：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "防御%", category: 2,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "fy_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "防御：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "命中%", category: 2,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "mz_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "命中：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "招架%", category: 2,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "zj_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "招架：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "躲闪%", category: 2,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "ds_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "躲闪：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "气血%", category: 2,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "hp_per", value_type: "percent", divisor: 20,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "气血上限：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "练习效率%", category: 2,
        positions: ["force", "parry", "dodge"],
        prop: "lianxi_per", value_type: "percent", divisor: 20,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "练习效率：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "学习效率%", category: 2,
        positions: ["force", "parry", "dodge"],
        prop: "study_per", value_type: "percent", divisor: 20,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "学习效率：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "打坐效率%", category: 2,
        positions: ["force", "parry", "dodge"],
        prop: "dazuo_per", value_type: "percent", divisor: 20,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "打坐效率：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    // ===== 稀有属性 (category 3) - 百分比/特殊 =====
    {
        name: "暴击%", category: 3,
        positions: ["force", "unarmed", "weapon"],
        prop: "bj_per", value_type: "percent", divisor: 30,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "暴击：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "暴击伤害%", category: 3,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "add_bjsh_per", value_type: "percent", divisor: 30,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "暴击伤害：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "暴击抵抗%", category: 3,
        positions: ["force", "unarmed", "weapon"],
        prop: "diff_bj_per", value_type: "percent", divisor: 35,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "暴击抵抗：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "忙乱%", category: 3,
        positions: ["force", "unarmed", "weapon"],
        prop: "busy_per", value_type: "percent", divisor: 30,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "忙乱时间：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "忽视忙乱%", category: 3,
        positions: ["force", "unarmed", "weapon"],
        prop: "diff_busy_per", value_type: "percent", divisor: 30,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "忽视忙乱：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "攻速%", category: 3,
        positions: ["force"],
        prop: "gjsd_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "攻速：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "内力消耗%", category: 3,
        positions: ["force", "parry", "dodge", "unarmed", "weapon"],
        prop: "expend_mp_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "内力消耗：-" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "伤害减免%", category: 3,
        positions: ["force", "unarmed", "weapon"],
        prop: "diff_sh_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "伤害减免：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "最终伤害%", category: 3,
        positions: ["force", "unarmed", "weapon"],
        prop: "add_sh_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "最终伤害：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "忽视对方防御%", category: 3,
        positions: ["force", "unarmed", "weapon"],
        prop: "diff_fy_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "忽视对方防御：+" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    // ===== 特殊属性 (category 4) - 固定时间/百分比 =====
    {
        name: "忙乱", category: 4,
        positions: ["force"],
        prop: "busy", value_type: "flat_time", multiplier: 10,
        value: function (lv, grade, word_level) {
            return Math.floor(lv * (grade + 1) * (word_level || 0) * this.multiplier / 3);
        },
        format: function (val) { return "忙乱：+" + (val / 1000).toFixed(1) + "秒"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "攻速", category: 4,
        positions: ["force"],
        prop: "gjsd", value_type: "flat_time", multiplier: 2,
        value: function (lv, grade, word_level) {
            return Math.floor(lv * (grade + 1) * (word_level || 0) * this.multiplier / 3);
        },
        format: function (val) { return "攻速：-" + (val / 1000).toFixed(1) + "秒"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "绝招释放", category: 4,
        positions: ["force"],
        prop: "releasetime", value_type: "flat_time", multiplier: 10,
        value: function (lv, grade, word_level) {
            return Math.floor(lv * (grade + 1) * (word_level || 0) * this.multiplier / 3);
        },
        format: function (val) { return "绝招释放：-" + (val / 1000).toFixed(1) + "秒"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "绝招释放%", category: 4,
        positions: ["force"],
        prop: "releasetime_per", value_type: "percent", divisor: 25,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "绝招释放：-" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "绝招冷却", category: 4,
        positions: ["force"],
        prop: "distime", value_type: "flat_time", multiplier: 15,
        value: function (lv, grade, word_level) {
            return Math.floor(lv * (grade + 1) * (word_level || 0) * this.multiplier / 3);
        },
        format: function (val) { return "绝招冷却：-" + (val / 1000).toFixed(1) + "秒"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "绝招冷却%", category: 4,
        positions: ["force"],
        prop: "distime_per", value_type: "percent", divisor: 35,
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) * (1 + grade) / (this.divisor * 2));
        },
        format: function (val) { return "绝招冷却：-" + val + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    // ===== 被动词条 (category "passive") - 内功 =====
    {
        name: "吸血", category: "passive",
        positions: ["force"],
        prop: "zc_lifesteal_force", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.51 + (word_level || 0) * 0.05;
        },
        format: function (val) { return "吸血：当你命中敌人会造成" + (val * 100).toFixed(0) + "%攻击力的内功伤害（太玄）"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "不灭", category: "passive",
        positions: ["force"],
        prop: "zc_undying", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.10 + (word_level || 0) * 0.005;
        },
        format: function (val) { return "不灭：当你的气血降低到10%时候会恢复" + (val * 100).toFixed(1) + "%气血并短时间无视伤害，冷却10分钟（混沌）"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "战神", category: "passive",
        positions: ["force"],
        prop: "zc_war_god", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.005 + (word_level || 0) * 0.0005;
        },
        format: function (val) { var dmgPct = (val * 100).toFixed(1); var absorbPct = ((val - 0.005) * 100).toFixed(1); return "战神：每次攻击附加你最大内力" + dmgPct + "%的伤害，当你空手时附加的内力加倍，并吸收" + absorbPct + "%伤害（战神）"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "反震", category: "passive",
        positions: ["force"],
        prop: "zc_rebound", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.005 + (word_level || 0) * 0.0005;
        },
        format: function (val) { return "反震：被命中后对敌人造成" + (val * 100).toFixed(1) + "%最大内力的反震伤害"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "守护", category: "passive",
        positions: ["force"],
        prop: "zc_guardian", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.011 + (word_level || 0) * 0.0011;
        },
        format: function (val) { return "守护：你的气血每降低1%减少受的" + (val * 100).toFixed(1) + "%伤害"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "剑心", category: "passive",
        positions: ["force"],
        prop: "zc_sword_heart", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 1 + Math.floor((word_level || 0) / 30);
        },
        format: function (val) { return "剑心：当你命中敌人后（攻击频率）会额外攻击敌人" + val + "次（剑心）"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    // ===== 被动词条 - 武器/拳脚 =====
    {
        name: "弱化", category: "passive",
        positions: ["unarmed", "weapon"],
        prop: "zc_weaken", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.011 + (word_level || 0) * 0.0011;
        },
        format: function (val) { return "弱化：当你命中敌人后使对方降低" + (val * 100).toFixed(1) + "%战斗属性，可叠加10层"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "溅射", category: "passive",
        positions: ["unarmed", "weapon"],
        prop: "zc_splash", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.81 + (word_level || 0) * 0.03;
        },
        format: function (val) { return "溅射：当你命中敌人后会对附近一名敌人产生" + (val * 100).toFixed(0) + "%伤害"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "吸血", category: "passive",
        positions: ["unarmed", "weapon"],
        prop: "zc_lifesteal", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.011 + (word_level || 0) * 0.0011;
        },
        format: function (val) { return "吸血：对敌人造成伤害后吸收" + (val * 100).toFixed(1) + "%转化为自身气血"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "穿透", category: "passive",
        positions: ["unarmed", "weapon"],
        prop: "zc_pierce", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.011 + (word_level || 0) * 0.0011;
        },
        format: function (val) { return "穿透：当你命中敌人后使对方受到的伤害增加" + (val * 100).toFixed(1) + "%，可叠加十层"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "无情", category: "passive",
        positions: ["unarmed", "weapon"],
        prop: "zc_merciless", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.005 + (word_level || 0) * 0.0005;
        },
        format: function (val) { return "无情：敌人的气血每降低1%增加你" + (val * 100).toFixed(1) + "%的伤害"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "嗜血", category: "passive",
        positions: ["unarmed", "weapon"],
        prop: "zc_bloodthirst", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.005 + (word_level || 0) * 0.0005;
        },
        format: function (val) { return "嗜血：你的气血每降低1%增加" + (val * 100).toFixed(1) + "%的伤害"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "内伤", category: "passive",
        positions: ["unarmed", "weapon"],
        prop: "zc_internal_injury", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.005 + (word_level || 0) * 0.0005;
        },
        format: function (val) { return "内伤：每次攻击附加你最大内力" + (val * 100).toFixed(1) + "%的伤害（入魔）"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    // ===== 被动词条 - 招架 =====
    {
        name: "反击", category: "passive",
        positions: ["parry"],
        prop: "zc_counter_parry", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.83 + (word_level || 0) * 0.03;
        },
        format: function (val) { return "反击：招架成功后顺势反击敌人，对敌人造成" + (val * 100).toFixed(0) + "%伤害（移花）"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "乾坤", category: "passive",
        positions: ["parry"],
        prop: "zc_qiankun", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.01 + (word_level || 0) * 0.001;
        },
        format: function (val) { return "乾坤：当你招架成功后增加" + (val * 100).toFixed(1) + "%伤害减免，招架成功叠加两层，最多叠加20层（乾坤）"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "纵横", category: "passive",
        positions: ["parry"],
        prop: "zc_zongheng", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.01 + (word_level || 0) * 0.001;
        },
        format: function (val) { return "纵横：当你招架成功后增加" + (val * 100).toFixed(1) + "%命中，可叠加10层（纵横）"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    // ===== 被动词条 - 轻功 =====
    {
        name: "反击", category: "passive",
        positions: ["dodge"],
        prop: "zc_counter_dodge", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.83 + (word_level || 0) * 0.03;
        },
        format: function (val) { return "反击：躲闪成功后顺势反击敌人，对敌人造成" + (val * 100).toFixed(0) + "%伤害"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "灵动", category: "passive",
        positions: ["dodge"],
        prop: "zc_lingdong", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.01 + (word_level || 0) * 0.001;
        },
        format: function (val) { return "灵动：躲闪成功后增加你" + (val * 100).toFixed(1) + "%的攻速和命中，最多叠加10层"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
    {
        name: "专注", category: "passive",
        positions: ["dodge"],
        prop: "zc_focus", value_type: "passive",
        value: function (lv, grade, word_level) {
            return 0.50 + (word_level || 0) * 0.02;
        },
        format: function (val) { return "专注：你的后天身法在战斗中提升躲闪的效果提高" + (val * 100).toFixed(0) + "%"; },
        base_pot_cost: 50000,
        upgrade_cost: function (target_level) { return this.base_pot_cost * target_level; },
    },
];

SKILL.prototype.query_attack_action = function (me, target) {
    if (this.attack_actions)
        return this.attack_actions.random();
    // 回退到基础武器类型的攻击描述
    var base = SKILL.get(this.type);
    if (base && base.attack_actions)
        return base.attack_actions.random();
    return "";
}
SKILL.prototype.query_dodge_action = function () {
    if (!this.dodge_actions) {
        return "";
    }
    return this.dodge_actions.random();
}
SKILL.prototype.query_parry_action = function (me, target, w2) {
    var w1 = me.query_weapon();
    w2 = w2 || target.query_weapon();
    var act;
    if (w1 && w2) {
        act = this.weapon_vs_weapon_actions || this.parry_actions;
    } else if (w1) {
        act = this.weapon_vs_unarmed_actions || this.parry_actions;
    } else if (w2) {
        act = this.unarmed_vs_weapon_actions || this.parry_actions;
    } else {
        act = this.parry_actions;
    }

    if (!act) {
        act = this.parry_actions = SKILL.get("parry").parry_actions;
    }

    if (act) {
        return act.random();
    }
}

SKILL.prototype.level_exp = function (lv, me) {
    var grd = this.query_grade(me);
    return (lv + 1) * (grd + 1) * 5;
}
SKILL.prototype.query_needexp = function (level, me) {
    if (level > 100) {
        var grd = this.query_grade(me);
        var exp = (100 + level) * (level - 100) / 2;
        return exp * (grd + 1) * 5;
    } else {
        return 0;
    }
}


SKILL.prototype.set_default = function (type) {
    WORLD.DEFAULT_SKILLS[type] = this;
}

SKILL.prototype.release_prop = function (me, lv) {
    if (!lv) return;
    var prop = this.query_prop(lv, me);
    if (prop) {
        me.change_prop(prop, false);
    }
    prop = this.query_enable_prop(lv, me);
    if (prop) {
        for (var item in prop) {
            if (me.is_enable_skill(this.id, item)) {
                me.change_prop(prop[item], false);
            }
        }
    }
    if (this.is_custom) {
        var bases = [];
        for (var i = 0; i < this.can_enables.length; i++) {
            if (me.is_enable_skill(this.id, this.can_enables[i]))
                bases.push(this.can_enables[i]);
        }
        if (bases.length > 0) {
            prop = this._compute_zc_props(me, bases);
            if (prop) me.change_prop(prop, false);
        }
    } else {
        prop = this.query_addin_prop(me, lv);
        if (prop) {
            if (this.is_enable(me)) {
                me.change_prop(prop, false);
            }
        }
    }
}

SKILL.prototype.attach_prop = function (me, lv) {
    if (!lv) return;
    var prop = this.query_prop(lv, me);
    if (prop) {
        me.change_prop(prop, true);
    }
    prop = this.query_enable_prop(lv, me);
    if (prop) {
        for (var item in prop) {
            if (me.is_enable_skill(this.id, item)) {
                me.change_prop(prop[item], true);
            }
        }
    }
    if (this.is_custom) {
        var bases = [];
        for (var i = 0; i < this.can_enables.length; i++) {
            if (me.is_enable_skill(this.id, this.can_enables[i]))
                bases.push(this.can_enables[i]);
        }
        if (bases.length > 0) {
            prop = this._compute_zc_props(me, bases);
            if (prop) me.change_prop(prop, true);
        }
    } else {
        prop = this.query_addin_prop(me, lv);
        if (prop) {
            if (this.is_enable(me)) {
                me.change_prop(prop, true);
            }
        }
    }
}
SKILL.prototype.query_enable_prop = function (lv) {

}
SKILL.prototype.query_prop = function (lv) {

}

SKILL.prototype.query_grade = function (me) {
    var sk = me.skills[this.id];
    var lv = this.grade;
    if (sk && !this.is_custom) {
        if (sk.addin)
            lv += sk.addin.length;
        if (sk.ref)
            lv += 1;
    }
    return Math.min(lv, 6);
}
SKILL.prototype.query_color_name = function (me) {

    var desc = level_color[this.query_grade(me)];
    return "<" + desc + ">" + this.name + "</" + desc + ">";
}

SKILL.prototype.query_addin_prop = function (me, lv) {
    var sk = me.skills[this.id];
    var addin = (sk && sk.addin) ? sk.addin : [];
    if (addin.length === 0 && !this.mp_to_hp)
        return null;
    var prop = {};
    var grd = this.is_custom ? this.grade : (this.grade + addin.length);
    for (let slot of addin) {
        let item = this.query_slot(slot);
        if (!item) continue;
        if (item.prop) {
            var wl = (sk && sk.word_levels && sk.word_levels[slot]);
            if (wl === undefined && SKILL.get_wl) wl = SKILL.get_wl(sk && sk.word_levels, slot, null);
            if (wl === undefined) wl = 1;
            prop[item.prop] = (prop[item.prop] ?? 0) + item.value(lv, grd, wl);
        }
    }
    if (this.mp_to_hp) {
        // HP conversion is handled via force_rad in recount(), not direct max_hp addition.
        // force_rad is set in create_or_update_skill and updated on word 506 upgrade/add.
        var wl506 = null;
        if (sk && sk.word_levels && sk.word_levels[506] !== undefined)
            wl506 = sk.word_levels[506];
        if (wl506 === null && SKILL.get_wl) {
            var pos506 = this.slot_to_position ? this.slot_to_position[506] : null;
            wl506 = SKILL.get_wl((sk && sk.word_levels), 506, Array.isArray(pos506) ? pos506[0] : pos506);
        }
        if (wl506 === null) wl506 = 0;
        var convRate = 29 + wl506;
        console.log("[ZC mp_to_hp] skill=" + this.id + " player=" + me.name + " convRate=" + convRate + "% (via force_rad=" + (this.force_rad || "unset") + ")");
    }
    return Object.keys(prop).length > 0 ? prop : null;
}
SKILL.prototype.is_enable = function (me) {
    if (this.type !== SKILL_TYPES.SKILL) return true;
    var skill = me.skills[this.id];
    for (var i = 0; i < this.can_enables.length; i++) {
        if (skill[this.can_enables[i]]) return true;
    }
    return false;
}
SKILL.prototype.is_enable2 = function (me, baseskill) {
    var skill = me.skills[this.id];

    return skill ? skill[baseskill] : false;
}
//激活技能,附加装备的部分属性
SKILL.prototype.enable = function (me, type) {
    if (!this.can_enables || !this.can_enables.contain(type)) return false;
    if (this.on_enable && this.on_enable(me, type) === false) return false;
    var lv = me.query_skill(this.id);
    var prop = this.query_enable_prop(lv);
    if (prop) {
        var enable_prop = prop[type];
        if (enable_prop) {
            me.change_prop(enable_prop, true);
        }
    }
    //附加进阶属性
    if (this.is_custom) {
        this._recalc_zc_addins(me, type, true);
    } else {
        prop = this.query_addin_prop(me, lv);
        if (prop) {
            if (!this.is_enable(me)) {
                me.change_prop(prop, true);
            }
        }
    }
    return true;
}
//取消激活技能,解除装备的部分属性
SKILL.prototype.disenable = function (me, type) {
    this.on_disenable && this.on_disenable(me, type);
    var lv = me.query_skill(this.id);
    var prop = this.query_enable_prop(lv);
    if (prop) {
        var enable_prop = prop[type];
        if (enable_prop) {
            me.change_prop(enable_prop, false);
        }
    }

    //附加进阶属性
    if (this.is_custom) {
        this._recalc_zc_addins(me, type, false);
    } else {
        prop = this.query_addin_prop(me, lv);
        if (prop) {
            if (!this.is_enable(me)) {
                me.change_prop(prop, false);
            }
        }
    }
    return true;
}
// Recompute ZC addin props when a base type is enabled or disabled.
// Removes all current addin props then re-applies per-position props.
// Each position's words are processed independently — the same word added
// to multiple positions (e.g. attack+3% in both 剑法 and 刀法) will stack.
SKILL.prototype._recalc_zc_addins = function(me, changed_type, is_enabling) {
    var sk = me.skills[this.id];
    var lv = me.query_skill(this.id);
    if (!this.zc_words_by_position) {
        // Fallback for old skills without per-position data
        var addin = (sk && sk.addin) ? sk.addin : [];
        if (addin.length === 0 && !this.mp_to_hp) return;
        var remove_bases = [];
        for (var i = 0; i < this.can_enables.length; i++) {
            var bt = this.can_enables[i];
            if (this.is_enable2(me, bt)) remove_bases.push(bt);
        }
        var keep_bases;
        if (is_enabling) {
            keep_bases = remove_bases.slice();
            if (keep_bases.indexOf(changed_type) < 0) keep_bases.push(changed_type);
        } else {
            if (remove_bases.indexOf(changed_type) < 0) remove_bases.push(changed_type);
            keep_bases = remove_bases.slice();
            var idx = keep_bases.indexOf(changed_type);
            if (idx >= 0) keep_bases.splice(idx, 1);
        }
        var grd = this.grade;
        // Remove old props for all affected bases (uses same computation as re-apply)
        if (remove_bases.length > 0) {
            var oldProps = {};
            var seen_slots_old = {};
            for (var bi = 0; bi < remove_bases.length; bi++) {
                var bt2 = remove_bases[bi];
                for (var si = 0; si < addin.length; si++) {
                    var slot = addin[si];
                    if (seen_slots_old[slot]) continue;
                    if (this.slot_to_position) {
                        var val = this.slot_to_position[slot];
                        if (!val) continue;
                        var posList = Array.isArray(val) ? val : [val];
                        var matches = false;
                        for (var pi = 0; pi < posList.length; pi++) {
                            var zpos = SKILL.ZC_POSITIONS && SKILL.ZC_POSITIONS[posList[pi]];
                            if (zpos && zpos.base === bt2) { matches = true; break; }
                        }
                        if (!matches) continue;
                    }
                    seen_slots_old[slot] = true;
                    var item = this.query_slot(slot);
                    if (!item || !item.prop) continue;
                    var slotPos = this.slot_to_position ? this.slot_to_position[slot] : undefined;
                    var pk = Array.isArray(slotPos) ? slotPos[0] : slotPos;
                    var rawVal = item.value(lv, grd, SKILL.get_wl ? SKILL.get_wl(sk.word_levels, slot, pk) : ((sk.word_levels && sk.word_levels[slot]) || 0));
                    if (item.value_type === "passive") {
                        oldProps[item.prop] = rawVal;
                    } else {
                        oldProps[item.prop] = (oldProps[item.prop] || 0) + parseInt(rawVal);
                    }
                }
            }
            if (Object.keys(oldProps).length > 0) {
                me.change_prop(oldProps, false);
            }
        }
        if (keep_bases.length === 0) return;
        var newProps = {};
        var seen_slots = {};
        for (var bi = 0; bi < keep_bases.length; bi++) {
            var bt2 = keep_bases[bi];
            for (var si = 0; si < addin.length; si++) {
                var slot = addin[si];
                if (seen_slots[slot]) continue;
                if (this.slot_to_position) {
                    var val = this.slot_to_position[slot];
                    if (!val) continue;
                    var posList = Array.isArray(val) ? val : [val];
                    var matches = false;
                    for (var pi = 0; pi < posList.length; pi++) {
                        var zpos = SKILL.ZC_POSITIONS && SKILL.ZC_POSITIONS[posList[pi]];
                        if (zpos && zpos.base === bt2) { matches = true; break; }
                    }
                    if (!matches) continue;
                }
                seen_slots[slot] = true;
                var item = this.query_slot(slot);
                if (!item || !item.prop) continue;
                var slotPos = this.slot_to_position ? this.slot_to_position[slot] : undefined;
                var pk = Array.isArray(slotPos) ? slotPos[0] : slotPos;
                var rawVal = item.value(lv, grd, SKILL.get_wl ? SKILL.get_wl(sk.word_levels, slot, pk) : ((sk.word_levels && sk.word_levels[slot]) || 0));
                if (item.value_type === "passive") {
                    newProps[item.prop] = rawVal;
                } else {
                    newProps[item.prop] = (newProps[item.prop] || 0) + parseInt(rawVal);
                }
            }
        }
        if (Object.keys(newProps).length > 0) {
            me.change_prop(newProps, true);
        }
        return;
    }

    // Determine "before" base types (currently enabled for enable,
    // or currently enabled + the type being removed for disenable)
    var before_bases = [];
    for (var i = 0; i < this.can_enables.length; i++) {
        var bt = this.can_enables[i];
        if (this.is_enable2(me, bt)) before_bases.push(bt);
    }
    var after_bases;
    if (is_enabling) {
        after_bases = before_bases.slice();
        if (after_bases.indexOf(changed_type) < 0) after_bases.push(changed_type);
    } else {
        // The changed_type was enabled before disenable (caller already set flag to false)
        before_bases.push(changed_type);
        after_bases = before_bases.slice();
        var idx = after_bases.indexOf(changed_type);
        if (idx >= 0) after_bases.splice(idx, 1);
    }

    // Remove old props
    var oldProps = this._compute_zc_props(me, before_bases);
    if (oldProps) me.change_prop(oldProps, false);

    // Apply new props
    if (after_bases.length > 0) {
        var newProps = this._compute_zc_props(me, after_bases);
        if (newProps) me.change_prop(newProps, true);
    }
};

// Compute per-position ZC props for given base types.
// Each position is processed independently so shared words stack.
SKILL.prototype._compute_zc_props = function(me, bases) {
    if (!bases || bases.length === 0) return null;
    var sk = me.skills[this.id];
    var lv = me.query_skill(this.id);
    var grd = this.grade;
    var props = {};

    for (var bi = 0; bi < bases.length; bi++) {
        var bt = bases[bi];
        for (var pk in this.zc_words_by_position) {
            var zpos = SKILL.ZC_POSITIONS && SKILL.ZC_POSITIONS[pk];
            if (!zpos || zpos.base !== bt) continue;
            var ws = this.zc_words_by_position[pk] || [];
            for (var wi = 0; wi < ws.length; wi++) {
                var slot = ws[wi];
                var item = this.query_slot(slot);
                if (!item || !item.prop) continue;
                var rawVal = item.value(lv, grd, SKILL.get_wl ? SKILL.get_wl(sk.word_levels, slot, pk) : ((sk.word_levels && sk.word_levels[slot]) || 0));
                if (item.value_type === "passive") {
                    props[item.prop] = rawVal;
                } else {
                    props[item.prop] = (props[item.prop] || 0) + parseInt(rawVal);
                }
            }
        }
    }
    return Object.keys(props).length > 0 ? props : null;
};
SKILL.prototype.do_learn = function (me) {
    if (this.on_learn && this.on_learn(me) === false) return false;
    if (this.learn_condition) {
        for (var key in this.learn_condition) {
            var val = this.learn_condition[key];
            switch (key) {
                case "skill":
                    for (var sk in val) {
                        if (me.query_skill(sk, 0) < val[sk] && me.query_skill(sk + "2", 0) < val[sk]) {
                            var sk_base = SKILL.get(sk);

                            return me.notify_fail("你的" + sk_base.color_name + "等级不够" + val[sk] + "，无法学习" + this.color_name + "。");
                        }
                    }
                    break;
                case "str1":
                case "con1":
                case "dex1":
                case "int1":
                    if (me.is_player && me[key.replace("1", "")] < val) {
                        return me.notify_fail("你的" + PROPERTIES[key] + "不够" + val + "，无法学习" + this.color_name + "。");
                    }
                    break;
                case "str":
                case "con":
                case "dex":
                case "int":
                    if (me[key] + me.query_prop(key) < val) {
                        return me.notify_fail("你的" + PROPERTIES[key] + "不够" + val + "，无法学习" + this.color_name + "。");
                    }
                    break;
                case "gender":
                    if (me.gender !== val) return me.notify_fail("你不是" + (val === 1 ? "男性" : val === 2 ? "女性" : "无性") + "，无法学习" + this.color_name + "。");
                    break;
                case "desc":
                    break;
                default:
                    var me_val = me[key] || 0;
                    me_val = me_val + me.query_prop(key);
                    if (!me_val || me_val < val) {

                        return me.notify_fail("你的" + PROPERTIES[key] + "不够" + val + "，无法学习" + this.color_name + "。");
                    }
                    break;
            }
        }
    } else {
        if (this.type === SKILL_TYPES.SKILL && this.can_enables) {
            for (var i = 0; i < this.can_enables.length; i++) {
                if (!me.query_skill(this.can_enables[i], 0)) {
                    var skill = SKILL.get(this.can_enables[i]);
                    return me.notify_fail("你还不会" + skill.color_name + "，无法学习" + this.color_name + "。");
                }
            }
        }
    }
    return true;
}

SKILL.prototype.condition_tostring = function (me) {
    if (this.learn_condition_string) return this.learn_condition_string;
    var str = [];
    if (this.learn_condition) {
        for (var key in this.learn_condition) {
            var val = this.learn_condition[key];
            switch (key) {
                case "skill":
                    for (var sk in val) {
                        var sk_base = SKILL.get(sk);
                        str.push(sk_base.name + "：" + val[sk] + "级");
                    }
                    break;
                case "desc":
                    str.push(val);
                    break;
                case "gender":
                    str.push("性别：" + (val === 1 ? "男" : (val === 2 ? "女" : "无性")));
                    break;
                default:
                    str.push(PROPERTIES[key] + "：" + val);
                    break;
            }
        }
    }
    this.learn_condition_string = str.join("\n");
    return this.learn_condition_string;
}
SKILL.prototype.item_to_json = function (str, skill_item, me) {
    str.push('{"id":"');
str.push(this.id);

str.push('","name":"');
str.push(this.query_color_name(me));
str.push('",grade:', this.query_grade(me));
    str.push(',"level":');
    str.push(me.query_skill(this.id));
    str.push(',"exp":');
    skill_item.exp = skill_item.exp || 0;
    str.push(parseInt(skill_item.exp * 100 / this.level_exp(skill_item.level, me)));
    if (this.can_enables) {
        str.push(',"can_enables":[');
        for (var i = 0; i < this.can_enables.length; i++) {
            if (i > 0) str.push(",");
            str.push('"');
str.push(this.can_enables[i]);
str.push('"');
        }
        str.push(']');
    }

    if (skill_item.enable_skill) {
        str.push(',"enable_skill":"');
str.push(skill_item.enable_skill);
str.push('"');
    }
    str.push('}');
}
SKILL.prototype.add_exp = function (me, exp) {
    var skill = me.skills[this.id];
    if (!skill) {
        skill = {
            // id: this.id,
            level: 0,
            exp: 0
        };
        var str = ['{type:"dialog",dialog:"skills",item:'];
        this.item_to_json(str, skill, me);
        str.push("}");
        me.notify(str.join(""));
        me.skills[this.id] = skill;
        if (this.type === SKILL_TYPES.BASE) {
            me.init_skill();
        }
    }
    var need_exp = this.level_exp(skill.level, me);
    skill.exp += exp;
    if (skill.exp >= need_exp) {
        this.release_prop(me, me.query_skill(this.id));
        var sum_score = 0;
        var color_name = this.query_color_name(me);
        var one_score = this.query_one_score(me);
        var max_lv = me.skill_limit ? me.skill_limit() : 9999;
        var old_level = skill.level;
        while (skill.exp >= need_exp && skill.level < max_lv) {
            skill.exp -= need_exp;
            need_exp = this.level_exp(skill.level, me);
            skill.level++;
            if (skill.level > 100)
                sum_score += one_score;
        }
        var gained = skill.level - old_level;
        if (gained > 0) {
            if (gained === 1) {
                me.notify("<hiy>你的" + color_name + "等级提升了！</hiy>");
            } else {
                me.notify("<hiy>你的" + color_name + "等级提升了！总共提升了" + gained + "级。</hiy>");
            }
        }
        if (skill.level >= max_lv && skill.exp >= need_exp) {
            skill.exp = 0;
            me.notify("<red>你的" + color_name + "已达当前等级上限，无法继续提升。</red>");
        }
        var lv = me.query_skill(this.id);
        this.attach_prop(me, lv);
        me.notify('{type:"dialog",dialog:"skills",id:"' + this.id + '",level:' + lv + ',exp:' + parseInt(skill.exp * 100 / need_exp) + '}');
        me.recount();
        me.add_score(sum_score);
        return true;
    } else {
        me.notify('{type:"dialog",dialog:"skills",id:"' + this.id + '",exp:' + parseInt(skill.exp * 100 / need_exp) + '}');
    }
}
SKILL.prototype.query_score = function (lv, me) {
    if (lv <= 100) return 0;
    return (lv - 100) * this.query_one_score(me);
}

SKILL.prototype.query_one_score = function (me) {
    var sc = 0;
    if (this.type === SKILL_TYPES.SKILL) {
        sc = this.query_grade(me);
    } else if (this.type === SKILL_TYPES.BASE) {
        sc = 1;
    }
    return sc;
}
SKILL.prototype.grade_up = function (me, target_skill) {
    var skill = me.skills[this.id];
    if (!skill || !(skill.level >= 1000)) return false;

    if (me.remove_skill(this.id) === false) return false;
    me.notify('{type:"dialog",dialog:"skills",remove:"' + this.id + '"}');
    var pot = this.query_needexp(skill.level, me);
    var lv = pot * 2 / 5 / (target_skill.grade + 1);
    skill = {
        level: parseInt(Math.pow(lv, 0.5)),
        exp: 0
    };
    me.skills[target_skill.id] = skill;
    var str = ['{type:"dialog",dialog:"skills",item:'];
    target_skill.item_to_json(str, skill, me);
    str.push("}");
    me.notify(str.join(""));
    me.add_score(target_skill.query_score(skill.level, me));
    target_skill.attach_prop(me, skill.level);
    me.recount();
    return true;
}
SKILL.prototype.get_pfm = function (name) {
    if (this.pfm) {
        return this.pfm[name];
    }
}
SKILL.prototype.set_pfm = function (name, obj) {
    if (!this.pfm) {
        this.pfm = {};
    }
    this.pfm[name] = obj;
}
var level_color = ["wht", "hig", "hic", "hiy", "hiz", "hio", "ord"];
var level_desc = ["基本技能", "普通技能", "高级技能", "稀有武技", "绝世武功", "绝世神功", "无上神武"];

SKILL.prototype.create = function (fname) {
    if (WORLD.SKILLS[this.id]) {
        console.log("%s [%s] is repeated ", this.id, fname);
    }
    this.update(fname);
}
SKILL.prototype.store = function () {
    if (this.type === SKILL_TYPES.KNOWLEDGE
        || this.type === SKILL_TYPES.BASE
    ) return;
    for (var i = 0; i < this.can_enables.length; i++) {
        if (!SKILL[this.can_enables[i]]) SKILL[this.can_enables[i]] = new Array(7);
        if (!SKILL[this.can_enables[i]][this.grade]) SKILL[this.can_enables[i]][this.grade] = [];
        SKILL[this.can_enables[i]][this.grade].push(this);
    }
}

SKILL.prototype.update = function (fname) {
    WORLD.SKILLS[this.id] = this;
    var fam = this.family || FAMILIES.NONE;

    // 自创技能只注册到 WORLD.SKILLS + store()，不加入公共技能池
    if (!this.is_custom) {
        if (!fam.skills2) fam.skills2 = [];
        if (!fam.skills) fam.skills = [];
        if (!fam.skills3) fam.skills3 = [];
        if (!fam.skills4) fam.skills4 = [];
        var isAddIn = false;
        var ary = this.source_skill ?
            (this.is_ultimate ? fam.skills3 : fam.skills2) :
            (this.is_ultimate ? fam.skills4 : fam.skills);
        if (this.type === SKILL_TYPES.KNOWLEDGE || this.is_hidden) {
            if (!fam.skills0) fam.skills0 = [];
            ary = fam.skills0;
        }
        for (var i = 0; i < ary.length; i++) {
            if (ary[i].id === this.id) {
                ary[i] = this;
                isAddIn = true;
                break;
            }
            if (ary[i].grade > this.grade) {
                ary.splice(i, 0, this);
                isAddIn = true;
                break;
            }
        }
        if (!isAddIn) {
            ary.push(this);
        }
    }

    this.store();

    var desc = level_color[this.grade];
    this.color_name = "<" + desc + ">" + this.name + "</" + desc + ">";
    if (this.pfm) {
        for (var key in this.pfm) {
            var pfm = this.pfm[key];
            if (pfm.enable_skill === 'sword' || pfm.enable_skill === 'blade' || pfm.enable_skill === 'whip'
                || pfm.enable_skill === 'staff' || pfm.enable_skill === 'club') {
                pfm.is_weapon = true;
            }
            pfm.id = this.id + "/" + key;
            pfm.pid = key;
            pfm.__proto__ = PERFORM.prototype;
        }
    }
}
SKILL.get = function (id) {
    return WORLD.SKILLS[id];
}
SKILL.prototype.query_desc = function (me, lv) {
    var str = [];
    var grd = this.query_grade(me);
    var cc = level_color[grd];
    str.push("<" + cc + ">" + this.name + "</" + cc + ">");
    str.push("\n");
    if (this.is_custom) {
        str.push("自创");
    } else if (this.family) {
        str.push(this.family.name);
    } else {
        str.push("公共");
    }
    str.push(level_desc[grd]);
    str.push("\n");

    str.push(this.desc);
    str.push("\n");
    var prop = this.query_prop(lv, me);
    if (prop) {
        str.push("<");
        str.push(cc);
        str.push(">");
        str.push(UTIL.prop_toString(prop));
        str.push("</");
        str.push(cc);
        str.push(">\n");
    }
    var sk = me.skills[this.id];
    prop = this.query_enable_prop(lv, me);
    var isEnable = this.type === SKILL_TYPES.KNOWLEDGE;
    if (prop) {
        var firstSection = true;
        for (var item in prop) {
            var is_enable = me.is_enable_skill(this.id, item);
            if (is_enable) isEnable = true;
            str.push(firstSection ? "<" : "\n<");
            firstSection = false;
            str.push(is_enable ? cc : "blk");
            str.push(">当装备为");
            str.push(SKILL.get(item).name);
            str.push("时：\n");
            var propStr = UTIL.prop_toString(prop[item]);
            str.push(propStr);
		// For custom skills, show words per-position for this base type.
		// Iterate positions directly to avoid duplicates when a word appears in multiple positions.
		// Passive words always displayed last in each position section.
		if (this.is_custom && sk && sk.addin && sk.addin.length) {
			let grd_addin = this.grade;
			if (SKILL.ZC_POSITIONS && this.zc_words_by_position) {
				var normalLines = [];
				var passiveLines = [];
				for (var pk in this.zc_words_by_position) {
					var zpos = SKILL.ZC_POSITIONS[pk];
					if (!zpos || zpos.base !== item) continue;
					var ws = this.zc_words_by_position[pk] || [];
					for (var wi = 0; wi < ws.length; wi++) {
						var slot = ws[wi];
						var addin_item = this.query_slot(slot);
						if (!addin_item) continue;
						var wl = (SKILL.get_wl ? SKILL.get_wl(sk.word_levels, slot, pk) : ((sk.word_levels && sk.word_levels[slot]) || 1));
						var line = addin_item.format(addin_item.value(lv, grd_addin, wl));
						if (addin_item.value_type === "passive") {
							passiveLines.push(line);
						} else {
							normalLines.push(line);
						}
					}
				}
				var allLines = normalLines.concat(passiveLines);
				if (allLines.length > 0) {
					if (propStr) str.push("\n");
					str.push(allLines.join("\n"));
				}
			}
		}
            str.push("</");
            str.push(is_enable ? cc : "blk");
            str.push(">");
        }
    }
    if (!this.is_custom && sk && sk.addin && sk.addin.length) {
        str.push("\n<");
        str.push(isEnable ? cc : "blk");
        str.push(">");

        let grd = this.is_custom ? this.grade : (this.grade + sk.addin.length);
        for (let slot of sk.addin) {
            let item = this.query_slot(slot);
            if (item) {
                str.push("◆");
                if (item.name) {
                    str.push(item.name);
                    str.push(" ");
                }
                var wl = (sk && sk.word_levels && sk.word_levels[slot]);
                if (wl === undefined && SKILL.get_wl) wl = SKILL.get_wl(sk && sk.word_levels, slot, null);
                if (wl === undefined || wl === null) wl = 1;
                str.push(item.format(item.value(lv, grd, wl)));
                if (this.mp_to_hp && slot === 506 && !this.is_custom) {
                    var wl506 = (sk && sk.word_levels && sk.word_levels[506]);
                    if (wl506 === undefined && SKILL.get_wl) wl506 = SKILL.get_wl(sk && sk.word_levels, 506, null);
                    if (wl506 === undefined || wl506 === null) wl506 = 1;
                    str.push("（转血量" + (29 + wl506) + "%）");
                }
                str.push("\n");
            }
        }
        str.push("</");
        str.push(isEnable ? cc : "blk");
        str.push(">\n");
    }
    if (this.pfm) {
        str.push("<line>绝招</line>\n");
        for (let item in this.pfm) {
            var p_item = this.pfm[item];
            if (!p_item.name) continue;
            this.query_pfm_desc(me, p_item, str, lv);
            str.push("\n\n");

        }
    }
    if (sk && sk.ref) {
        var refs = sk.ref.split("/");
        var sp_skill = SKILL.get(refs[0]);
        if (sp_skill) {
            var pfm = sp_skill.get_pfm(refs[1]);
            if (pfm) {
                this.query_pfm_desc(me, pfm, str, lv, sp_skill.name);
                str.push("\n\n");
            }
        }


    }
    return str.join("");
}
SKILL.prototype.query_slot = function (index) {
    if (index < 500) {
        return SKILL.PROPERTIES[index];
    } else {
        return this.slots ? this.slots[index - 500] : null;
    }
}
SKILL.REF_CD = 2;
SKILL.SLOTS = {};
SKILL.prototype.query_pfm_desc = function (me, p_item, str, lv, pname) {
    var canuse = !p_item.check || p_item.check(me, lv) === true;
    var color = canuse ? "hic" : "red";
    if (pname) color = 'hir';
    str.push("<");
    str.push(color);
    str.push(">【");
    if (pname) {
        str.push(pname);
        str.push("•");

    }
    str.push(p_item.name);
    str.push("】");
    if (!canuse) {
        str.push(p_item.use_condition || "");
    }
    str.push("</");
    str.push(color);
    str.push(">");
    if (pname) lv = parseInt(lv / 2);
    str.push("\n内力消耗：");
    str.push(p_item.query_mp(me, lv));
    str.push("\t出招时间：");
    str.push(p_item.query_releasetime(me, lv) / 1000);
    str.push("秒\t冷却时间：");
    str.push(p_item.query_distime(me, lv, pname) / 1000);
    str.push("秒\n");
    str.push(p_item.query_desc(me, lv));
}


PERFORM = function () {
    this.name = "";
}
PERFORM.inherits(BASE);

PERFORM.prototype.query_name = function (me) {
    return this.name;
}

PERFORM.prototype.change_distime = function (me, id, add_time) {
    if (me.is_player) {
        var dis_time = me.temp["pfm/" + id];
        if (dis_time) {
            if (add_time)
                dis_time.e += add_time;
            else {
                add_time = -dis_time.time;
                dis_time.e = 1;
            }
            me.notify('{type:"changepfm",id:"' + id + '",time:' + add_time + '}');
        }
    } else if (me.auto_skills) {
        for (var i = 0; i < me.auto_skills.length; i++) {
            var item = me.auto_skills[i];
            if (item.pfm === this) {
                if (add_time)
                    item.release_time += add_time;
                else
                    item.release_time = 0;
            }
        }
    }

}
