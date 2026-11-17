this.inherits(NPC);
this.set({
    name: "不平道人",
    desc: "三十六洞洞主之一，道貌岸然，实则阴险毒辣。",
    gender: 1,
    age: 45,
    per: 14,
    hp: 717600,
    max_hp: 717600,
    mp: 176000,
    max_mp: 176000,
    score: 30,
    gj: 52182,
    fy: 40534,
    mz: 71786,
    ds: 42061,
    zj: 1260
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2381],
    ["parry", 2409],
    ["force", 2381],
    ["sword", 2381]
);
this.set_drop({
    obj: "money/silver",
    min: 10,
    max: 100
}, {
    obj: ["eq/lv4/zhuyandan"],
    odds: 6360
});
// 叫杀由断魂崖 pm/ya.js 统一安排：先扑向童姥，再对付玩家（攻略：速度要快，否则女童会被两个小怪秒杀）
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("不平道人冷笑道：「无知小儿，敢来断魂崖送死！」");
};
// NPC（如童姥）补刀不计分，只有玩家亲手击杀才算（见 world/area/fb1/fb26.js pm_credit）
this.on_died = function (killer) {
    var room = this.environment, area = room && room.parent;
    if (area && area.pm_credit) area.pm_credit(this, killer);
};
