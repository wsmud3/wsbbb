this.inherits(NPC);
this.set({
    name: "血刀老祖",
    desc: "血刀门掌门，一身血海魔功歹毒无比。他血刀在手，越战越勇，血越少越强。",
    title: "<hir>血刀老祖</hir>",
    gender: 1,
    age: 65,
    per: 8,
    hp: 4172800,
    max_hp: 4172800,
    mp: 946000,
    max_mp: 946000,
    score: 100,
    gj: 300800,
    fy: 125984,
    mz: 292800,
    ds: 121412,
    zj: 2520
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 5725],
    ["parry", 4375],
    ["force", 5575],
    ["blade", 5575],
    ["xuehaimogong", 5575, "force"],
    ["xuedao", 5575, "blade"],
    ["shenkongxing2", 5725, "dodge"]
);
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["book/bc#xuehaimogong"], odds: 12700},
    {obj: ["book/bc#xuedao"], odds: 12700},
    {obj: ["book/bc#shenkongxing2"], odds: 12700},
    {obj: ["eq/lv5/wushen/xuedao_blade"], odds: 7620}
);
this.on_enter = function (me) { me.notify("血刀老祖狞笑道：'天堂有路你不走，地狱无门你闯进来！准备受死吧！'"); this.do_kill(me); };
