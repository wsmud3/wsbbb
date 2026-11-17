this.inherits(NPC);
this.set({
    name: "白衣少女",
    desc: "一名身着白衣的少女，美艳不可方物，却是欧阳锋的侍妾，擅长使用毒功。",
    gender: 2,
    age: 22,
    per: 28,
    hp: 340000,
    max_hp: 340000,
    mp: 141000,
    max_mp: 141000,
    score: 20,   // 须击杀（攻略：杀了欧阳锋和白衣少女）
    gj: 22348,
    fy: 8494,
    mz: 16436,
    ds: 11121,
    zj: 389
});
this.skill_map(
    ["dodge", 1752],
    ["parry", 1962],
    ["force", 1752],
    ["unarmed", 1752]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#chanchubufa"],
    odds: 6800
});
// 攻略第 20 节：可与她比试，借机刷玩家自己的五神剑 buff（祝融最好），之后与欧阳锋一并击杀。
// 不主动叫杀（好让玩家先比试）；score > 0，不杀会卡 99%。
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("白衣少女冷冷道：擅闯白驼山花园，你可知死字怎么写？要不要先跟我比划两招？");
};
