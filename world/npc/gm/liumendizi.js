this.inherits(NPC);
this.set({
    name: "六大门派弟子",
    desc: "围攻光明顶的六大门派弟子，衣着各不相同，却都握紧了兵刃。他们被张无忌的乾坤大挪移挨个打下去，倒下一个，明教这边便多一分士气。",
    title: "六大派",
    gender: 1,
    age: 25,
    per: 20,
    hp: 300000,
    max_hp: 300000,
    mp: 90000,
    max_mp: 90000,
    score: 0,
    gj: 20000,
    fy: 12000,
    mz: 16000,
    ds: 13000,
    zj: 850
});
this.set_objects(["eq/lv0/cloth", 1, 1], ["eq/lv0/jian", 1, 1]);
this.skill_map(
    ["dodge", 1600],
    ["parry", 1600],
    ["force", 1600],
    ["sword", 1600]);
this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 60
});
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("六大门派弟子喝道：「魔教妖人，人人得而诛之！」提剑便攻。");
    this.do_kill(me);
};
