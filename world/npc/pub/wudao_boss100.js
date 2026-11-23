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
//   第一百层：原版 100 层守护者——特殊技能 5000 级、基础技能 4000 级，气血 1000 + 100² × 1250（1250 万）。
//   上 N 层（101~105 层）：以第一百层为基准逐层加强——特殊技能 5000 + (N-1)×500 级，基础技能 4000 + (N-1)×500 级，
//            气血 3000 万 + (N-1)×500 万。
//   四项先天属性一律 20 + 层数/3。五项战斗属性主要来自所装技能，不再额外叠加。
this.init_from = function (player, level) {
    var n = parseInt(level) || 0;
    if (n > 5) n = 5;
    var floor = 100 + n;
    var sp = n > 0 ? 5000 + (n - 1) * 500 : 5000, base = n > 0 ? 4000 + (n - 1) * 500 : 4000;
    this.con = this.dex = this.int = this.str = 20 + parseInt(floor / 3);
    this.name = UTIL.random_name(this.gender);
    this.skill_map(
        ["force", base], ["unarmed", base], ["sword", base], ["parry", base], ["dodge", base],
        ["jiuyangshengong", sp, "force"], ["liumaishenjian", sp, "unarmed"],
        ["xuantiejianfa", sp, "sword"], ["qiankundanuoyi", sp, "parry"], ["lingboweibu2", sp, "dodge"]
    );
    this.title = "武道守护者";
    this.set_objects(['eq/lv0/cloth', 1, 1], ["eq/lv0/jian", 1, 1]);

    this.hp = this.max_hp = n > 0 ? 30000000 + (n - 1) * 5000000 : 1000 + 100 * 100 * 1250;
    this.mp = this.max_mp = parseInt(this.hp / 2);
    this.init();
    this.recount();
}
