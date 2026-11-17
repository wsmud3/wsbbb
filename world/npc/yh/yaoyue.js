this.inherits(NPC);
this.set({
    name: "邀月",
    desc: "移花宫大宫主，冷若冰霜，武功盖世。明玉功第九重，举手投足皆有宗师风范。",
    title: "<hiy>移花大宫主</hiy>",
    gender: 0,
    age: 35,
    per: 24,
    hp: 521739,
    max_hp: 521739,
    mp: 219000,
    max_mp: 219000,
    score: 90,
    gj: 37500,
    fy: 19500,
    mz: 29918,
    ds: 19880,
    zj: 894
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2616],
    ["parry", 2680],
    ["force", 2616],
    ["sword", 2616],
    ["mingyugong", 2616, "force"],
    ["yihuajiemu", 2680, "parry"],
    ["yifengjianfa", 2616, "sword"]);
this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 300
}, {
    obj: ["book/bc#mingyugong"],
    odds: 9550
}, {
    obj: ["book/bc#yihuajiemu"],
    odds: 9550
}, {
    obj: ["eq/lv3/yaoyue_shouzhuo"],
    odds: 5730
});
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    if (me.gender == 2) {
        me.notify("邀月宫主淡淡道：同为女子，我不为难你。说着别过脸去。");
        return;
    }
    me.notify("邀月宫主冷若冰霜地注视着你，明玉功真气四溢，寒意刺骨！");
    this.do_kill(me);
};

// 宫主机制（world/area/fb1/fb23.js）：
//   死后自己宫里露出花丛、定下花数；困难模式另一位宫主会来帮忙。
this.on_died = function (killer) {
    var room = this.environment;
    var area = room && room.parent;
    if (area && area.yh_master_died) area.yh_master_died(this, killer);
};
this.on_heart_beat = function () {
    var room = this.environment;
    var area = room && room.parent;
    if (area && area.yh_assist_tick) area.yh_assist_tick(this);
};
