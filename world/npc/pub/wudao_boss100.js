this.inherits(NPC);
this.set({
    name: "",
    desc: "他是武道塔第一百层的终极守护者，周身环绕着浩瀚的武道气息，举手投足间天地为之变色。",
    title: "武道守护者",
    gender: 1,
    age: 30,
    per: this.random(50) + 30,
    mp: 500000,
    max_mp: 500000,
    hp: 500000,
    max_hp: 500000,
    no_refresh: true,
    no_fight: true
});

// 第一百层（wudao/ta100，不传层号）与上 1~5 层（wudao/ta2，传 1~5）的守护者。
//   技能：原版 100 层那一档（九阳/六脉/玄铁/乾坤/凌波），只负责招式与绝招；上 N 层技能每层 +500 级。
//   数值（与 wudao.js 的标定曲线衔接，99 层为 攻击/命中 12 万、闪避/招架 7 万、气血 500 万）：
//     第一百层：攻击/命中 13 万，闪避/招架 8 万，防御 = 攻击 × 0.3，气血 1250 万
//     上 N 层：攻击/命中/闪避/招架/防御 在第一百层基础上每层 +10%，气血 3000 万 + (N-1)×500 万
var BOSS100 = { gj: 130000, mz: 130000, ds: 80000, zj: 80000 };
this.init_from = function (player, level) {
    var n = parseInt(level) || 0;
    if (n > 5) n = 5;
    var floor = 100 + n;
    var sp = 5000 + Math.max(0, n - 1) * 500, base = 4000 + Math.max(0, n - 1) * 500;
    this.con = this.dex = this.int = this.str = 20 + parseInt(floor / 3);
    this.name = UTIL.random_name(this.gender);
    this.skill_map(
        ["force", base], ["unarmed", base], ["sword", base], ["parry", base], ["dodge", base],
        ["jiuyangshengong", sp, "force"], ["liumaishenjian", sp, "unarmed"],
        ["xuantiejianfa", sp, "sword"], ["qiankundanuoyi", sp, "parry"], ["lingboweibu2", sp, "dodge"]
    );
    this.title = "武道守护者";
    this.set_objects(['eq/lv0/cloth', 1, 1], ["eq/lv0/jian", 1, 1]);
    this.init();
    this.recount();

    var k = 1 + 0.1 * n;
    this.gj = Math.round(BOSS100.gj * k); this.mz = Math.round(BOSS100.mz * k);
    this.ds = Math.round(BOSS100.ds * k); this.zj = Math.round(BOSS100.zj * k);
    this.fy = Math.round(this.gj * 0.3);
    this.hp = this.max_hp = n > 0 ? 30000000 + (n - 1) * 5000000 : 12500000;
    this.mp = this.max_mp = parseInt(this.hp / 2);
    this.recount();
}
