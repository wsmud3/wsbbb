this.inherits(NPC);
this.set({
    name: "涟星",
    desc: "移花宫二宫主，温柔似水，但武功丝毫不逊于邀月。",
    title: "移花二宫主",
    gender: 0,
    age: 32,
    per: 22,
    hp: 924600,
    max_hp: 924600,
    mp: 262500,
    max_mp: 262500,
    score: 85,
    gj: 32582,
    fy: 19697,
    mz: 28689,
    ds: 17440,
    zj: 813
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2440],
    ["parry", 2592],
    ["force", 2440],
    ["sword", 2440],
    ["mingyugong", 2440, "force"],
    ["yihuajiemu", 2592, "parry"],
    ["yifengjianfa", 2440, "sword"]);
this.set_drop({
    obj: "money/silver",
    min: 25,
    max: 250
}, {
    obj: ["book/bc#yifengjianfa"],
    odds: 9550
}, {
    obj: ["eq/lv3/lianxing_bingyuzan"],
    odds: 5730
});
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    if (me.gender == 2) {
        me.notify("涟星宫主柔声道：是个姑娘，倒是难得的客人。");
        return;
    }
    me.notify("涟星宫主微微一笑，剑光如涟如星，霎时笼罩四周！");
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
