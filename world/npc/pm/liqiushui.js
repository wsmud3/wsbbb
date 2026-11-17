this.inherits(NPC);
this.set({
    name: "李秋水",
    desc: "西夏皇太妃，天山童姥的宿敌。白虹掌力惊天动地，容颜虽毁，武功犹在。",
    title: "<hiy>西夏皇太妃</hiy>",
    gender: 2,
    age: 88,
    per: 10,
    hp: 1294800,
    max_hp: 1294800,
    mp: 210000,
    max_mp: 210000,
    score: 50,
    gj: 95160,
    fy: 43948,
    mz: 96720,
    ds: 50774,
    zj: 1980
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2616],
    ["parry", 2680],
    ["force", 2880],
    ["unarmed", 2880],
    ["lingboweibu", 2616, "dodge"],
    ["liuyangzhang", 2616, "unarmed"],
    ["bulaochangchungong", 2616, "force"],);
this.set_drop({
    obj: "money/silver", min: 50, max: 500
}, {
    obj: ["book/bc#bulaochangchungong"], odds: 10600
}, {
    obj: ["book/bc#shenjianjue"], odds: 10600
}, {
    obj: ["eq/lv5/wushen/tianlong_necklace"], odds: 6360, diff: 1   // 天龙遗珠仅困难
});

// [mech] 护送童姥（规则见 world/area/fb1/fb26.js）：李秋水不主动出手，只拦住上山的路；
// 童姥落地后她会叫杀童姥。计分只算她自己的 50 分，100% 要靠把童姥送进闭关室。
// 天龙遗珠仅困难模式掉落：掉落条目标 diff:1，由框架在击杀与扫荡时按难度过滤。
this.on_leave = function (me, dir) {
    if (!me || !me.is_player || this.hp <= 0) return true;
    if (dir !== "northup") return true;
    me.notify("<hir>李秋水衣袖一拂，挡在山道正中：「想上缥缈峰？先过我这一关。」</hir>");
    return false;
};
this.on_died = function (killer) {
    var room = this.environment, area = room && room.parent;
    if (area && area.pm_on_lqs_died) area.pm_on_lqs_died(this, killer);
};
