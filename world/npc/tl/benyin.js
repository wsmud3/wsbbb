this.inherits(NPC);
this.set({
    name: "天龙寺主持 本因",
    desc: "天龙寺住持，枯荣大师的师侄，一手六脉神剑中的商阳剑已有相当火候。他为人持重，护寺心切，见外人窥探六脉神剑谱便不再留手。",
    title: "天龙寺主持",
    gender: 1,
    age: 55,
    per: 10,
    hp: 900000,
    max_hp: 900000,
    mp: 300000,
    max_mp: 300000,
    score: 0,
    gj: 56000,
    fy: 38000,
    mz: 52000,
    ds: 35000,
    zj: 1500
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2450],
    ["parry", 2450],
    ["force", 2450],
    ["unarmed", 2450],
    ["sword", 2450]);
this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 150
}, {
    obj: ["book/bc#kumushengong"],
    odds: 8100
});
// 天龙寺机制见 world/area/fb1/fb28.js：崇圣宝殿不在去牟尼堂的路上（攻略：不用管），
// 平时不主动出手；背起段誉后与其余高僧一起追杀。背段誉前杀了他同样计入杀人数。
var tlA = function (o) { var r = o.environment || o.die_room; return r && r.parent && r.parent.tl_carry ? r.parent : null; };
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    var a = tlA(this);
    if (a && a.tl_is_carrying(me)) {
        me.notify("本因并指为剑：「放下段誉！」剑气森然。"); this.do_kill(me);
    } else {
        me.notify("本因合十道：「佛门清净地，施主请自重。」");
    }
};
this.on_died = function (killer, corpse) {
    var a = tlA(this);
    if (a) a.tl_on_died(this, killer);
};
