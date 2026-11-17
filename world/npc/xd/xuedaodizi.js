this.inherits(NPC);
this.set({
    name: "血刀弟子",
    desc: "血刀门的弟子，手持血刀，面目狰狞。",
    gender: 1,
    age: 30,
    per: 10,
    hp: 197136,
    max_hp: 197136,   // 攻略：两名弟子 50w、60w 血
    mp: 302000,
    max_mp: 302000,
    score: 0,
    gj: 40027,
    fy: 35050,
    mz: 40598,
    ds: 32727,
    zj: 699
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3850],
    ["parry", 3700],
    ["force", 3850],
    ["blade", 3850],
    ["xuedao", 3850, "blade"]
);
this.set_drop(
    {obj: "money/silver", min: 10, max: 100},
    {obj: ["book/bc#xuedao"], odds: 7620}
);
this.on_enter = function (me) { me.notify("血刀弟子怪叫一声，举刀向你砍来！"); this.do_kill(me); };
// 原先这里死后会让血刀老祖往山谷走一步；按攻略老祖只在砍死「落花流水」四侠时才走（见 fb29.js）。

// 开战后副本里每死一个 NPC，血刀老祖就往山谷走一步（规则见 world/area/fb1/fb29.js xd_npc_died）
this.on_died = function (killer, corpse) {
    var room = this.environment || this.die_room;
    if (room && room.parent && room.parent.xd_npc_died) room.parent.xd_npc_died(this, killer);
};
