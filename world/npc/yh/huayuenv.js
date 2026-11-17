this.inherits(NPC);
this.set({
    name: "花月奴",
    desc: "移花宫的侍女，貌美如花，剑法冷厉。",
    gender: 0,
    age: 22,
    per: 20,
    hp: 763600,
    max_hp: 763600,
    mp: 154400,
    max_mp: 154400,
    score: 55,
    gj: 25225,
    fy: 15126,
    mz: 26158,
    ds: 16468,
    zj: 488
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2332],
    ["parry", 2052],
    ["force", 2332],
    ["sword", 2332]);
this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 100
}, {
    obj: ["eq/lv4/yihuagongzhuang"],
    odds: 5730
}, {
    obj: ["eq/lv4/yihuagonglv"],
    odds: 5730
});
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    if (me.gender == 2) {
        me.notify("花月奴看了你一眼，见你是女子，收剑退到一旁：姑娘请便。");
        return;
    }
    me.notify("花月奴娇叱一声，长剑如花纷落，剑光笼罩四周！");
    this.do_kill(me);
};
