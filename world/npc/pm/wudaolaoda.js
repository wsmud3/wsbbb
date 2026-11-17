this.inherits(NPC);
this.set({
    name: "乌道老大",
    desc: "三十六洞洞主之一，围攻天山童姥的恶徒。",
    gender: 1,
    age: 42,
    per: 12,
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
    ["unarmed", 2381]
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
    me.notify("乌道老大喝道：「来者何人？敢坏我等大事！」");
};
// 童姥补了最后一刀时补记分数（见 world/area/fb1/fb26.js pm_credit）
this.on_died = function (killer) {
    var room = this.environment, area = room && room.parent;
    if (area && area.pm_credit) area.pm_credit(this, killer);
};
