this.inherits(NPC);
this.set({
    name: "<hiy>张无忌</hiy>",
    desc: "明教教主，身怀九阳神功和乾坤大挪移两大绝学，武功当世无敌。",
    title: "明教教主",
    gender: 1,
    age: 22,
    per: 24,
    hp: 10000000,
    max_hp: 10000000,
    mp: 253500,
    max_mp: 253500,
    score: 100,
    gj: 74480,
    fy: 50014,
    mz: 86240,
    ds: 54760,
    zj: 2660
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2864],
    ["parry", 2520],
    ["force", 2608],
    ["unarmed", 2608],
    ["jiuyangshengong", 2608, "force"],
    ["qiankundanuoyi", 2864, "parry"],
);
this.set_drop(
    {obj: "money/silver", min: 50, max: 500},
    {obj: ["book/bc#jiuyangshengong"], odds: 11300},
    {obj: ["book/bc#qiankundanuoyi"], odds: 11300},
    {obj: ["eq/lv4/shenghuoling"], odds: 6780}
);
// [mech] 张无忌（黄名）不主动叫杀（攻略：先秒左右光明使，再单挑张无忌）。
// 六大门派弟子每死一人他多一层号令，攻击随层数上涨（规则见 world/area/fb1/fb27.js）。
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    var room = this.environment, area = room && room.parent;
    if (area && area.gm_apply_haoling) area.gm_apply_haoling(this);
    var n = area && area.gm_get ? area.gm_get(room, "gm_haoling", 0) : 0;
    me.notify("张无忌立在圣火之前，并不出手，只淡淡看着你。");
};
this.on_kill = function (me) {
    var room = this.environment, area = room && room.parent;
    if (area && area.gm_apply_haoling) area.gm_apply_haoling(this);
    if (me && me.is_player) me.notify("张无忌缓缓站起，九阳神功真气鼓荡，沉声道：「明教存亡，在此一战！」");
    return true;
};
