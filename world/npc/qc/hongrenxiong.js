this.inherits(NPC);
this.set({
    name: "洪人雄",
    desc: "青城四秀之一，身材粗壮，出手最是莽撞。",
    title: "青城四秀",
    gender: 1,
    age: 24,
    per: 22,
    hp: 130000,
    max_hp: 130000,
    mp: 38000,
    max_mp: 38000,
    score: 0,
    gj: 7900,
    fy: 5400,
    mz: 7000,
    ds: 5500,
    zj: 620
});
this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
this.skill_map(
    ["dodge", 1080],
    ["parry", 1080],
    ["force", 1080],
    ["sword", 1080],
    ["songfengjianfa", 1080, "sword"],
    ["tagexing", 1080, "dodge"]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 30},
    {obj: ["book/bc#songfengjianfa"], odds: 4260}
);
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("洪人雄横剑拦路，冷笑道：青城山门，也是你能乱闯的？");
    this.do_kill(me);
};
