this.inherits(NPC);
this.set({
    name: "狄云",
    desc: "一个衣衫褴褛的男子，眼神中透着不屈。他正是《连城诀》中的狄云。",
    gender: 1,
    age: 25,
    per: 14,
    hp: 40144,
    max_hp: 40144,
    mp: 8000,
    max_mp: 8000,
    score: 0,
    gj: 1715,
    fy: 1127,
    mz: 1487,
    ds: 759,
    zj: 559
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 600],
    ["parry", 560],
    ["force", 600],
    ["unarmed", 600],
    ["shenzhaojing", 600, "force"]
);
this.set_drop(
    {obj: ["book/bc#shenzhaojing"], odds: 7620}
);
// 狄云是被囚禁的NPC，不主动攻击玩家
// 原先这里死后会让血刀老祖往山谷走一步；按攻略老祖只在砍死「落花流水」四侠时才走（见 fb29.js）。

// 开战后副本里每死一个 NPC，血刀老祖就往山谷走一步（规则见 world/area/fb1/fb29.js xd_npc_died）
this.on_died = function (killer, corpse) {
    var room = this.environment || this.die_room;
    if (room && room.parent && room.parent.xd_npc_died) room.parent.xd_npc_died(this, killer);
};
