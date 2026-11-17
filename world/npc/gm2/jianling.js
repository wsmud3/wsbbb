this.inherits(NPC);
this.set({
    name: "剑灵",
    desc: "剑冢中守护神剑的剑灵，剑气纵横，威力无穷。",
    title: "剑灵",
    gender: 1,
    age: 999,
    per: 20,
    hp: 5320000,
    max_hp: 5320000,
    mp: 754000,
    max_mp: 754000,
    score: 205,
    gj: 142788,
    fy: 67250,
    mz: 117228,
    ds: 81907,
    zj: 1534
});
// 手持古剑（攻略：可以毒钩/折梅手下武器）
this.set_objects(["eq/lv0/cloth", 1, 1], ["gm2/jianzhong_jian", 1, 1]);
this.skill_map(
    ["dodge", 5850],
    ["parry", 4775],
    ["force", 5375],
    ["sword", 5375]
);
// 盘龙簪仅普通、龙骨环仅困难：剑冢房间 on_set_difficulty 按模式过滤
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["eq/lv4/bingpoyinzhen"], odds: 150},
    {obj: ["eq/lv5/wushen/panlong_head"], odds: 30, diff: 0},   // 只在普通模式掉
    {obj: ["eq/lv5/wushen/longgu_ring"], odds: 30, diff: 1}     // 只在困难模式掉
);
// 普通：剑灵不主动出手（「剑灵可以无缝控死，他很逊」）
// 困难：剑魔——主动叫杀、控不住、绝对命中（凌波也躲不开，但仍可被招架）
this.on_enter = function (me) {
    if (!me || !me.is_player || !this.gm2_jianmo || this.hp <= 0) return;
    me.notify("<hir>剑魔眼中血光一闪，万道剑气铺天盖地而来！</hir>");
    this.do_kill(me);
};
this.gm2_make_jianmo = function () {
    this.gm2_jianmo = true;
    this.name = "剑魔";
    this.title = "剑魔";
    this.desc = "剑冢中积郁千年的剑气化成的魔物，剑势诡异莫测，出手必中，任何控制手段都奈何不了它。";
    this.add_prop("ig_control", 1);
    this.ig_control = 1;
    this.json = null;   // 名字变了，丢掉缓存的展示数据
};
this.do_attack = function (par) {
    if (this.gm2_jianmo && par) par.no_dodge = true;
    return CHARACTER.prototype.do_attack.call(this, par);
};
