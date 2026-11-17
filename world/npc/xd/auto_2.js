this.inherits(NPC);
// 「落花流水」四侠之一。一开始就在山洞里与血刀老祖对峙，可被玩家叫杀。
// 机制（world/area/fb1/fb29.js）：开战后副本里每死一个 NPC，老祖就往山谷退一步；四侠跟着他走。
this.set({
    name: "花铁干",
    title: "<hic>中平无敌</hic>",
    desc: "「落花流水」四侠之一，一路追杀血刀老祖至此，誓要为江湖除此大害。",
    gender: 1,
    age: 50,
    per: 18,
    hp: 4000000,
    max_hp: 4000000,
    mp: 300000,
    max_mp: 300000,
    score: 0,
    gj: 60000,
    fy: 43000,   // 实测老祖对四侠约 21.7 万/秒，气血 360~450 万 ≈ 每人撑 17~21 秒（老祖两步至少隔 10 秒）
    mz: 60000,
    ds: 40000,
    zj: 1785
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3865],
    ["parry", 3760],
    ["force", 3865],
    ["unarmed", 3865]
);
this.on_died = function (killer, corpse) {
    var room = this.environment;
    if (room && room.parent && room.parent.xd_npc_died) room.parent.xd_npc_died(this, killer);
};
