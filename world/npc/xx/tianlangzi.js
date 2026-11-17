this.inherits(NPC);
this.set({
    name: "天狼子",
    desc: "星宿派三师兄，一身邪气，擅长飞星术。",
    gender: 1,
    age: 30,
    per: 8,
    hp: 487198,
    max_hp: 487198,
    mp: 101000,
    max_mp: 101000,
    score: 0,
    gj: 35070,
    fy: 19488,
    mz: 38010,
    ds: 23329,
    zj: 930
});
this.skill_map(
    ["dodge", 2032],
    ["parry", 1836],
    ["force", 2032],
    ["unarmed", 2032],
    ["feixingshu", 2032, "unarmed"],
    ["zhaixinggong", 2032, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#feixingshu"],
    odds: 8850
}, {
    obj: ["book/bc#zhaixinggong"],
    odds: 7080
});
// 攻略第 21 节：此关只需击杀丁春秋和狮吼子，其他人不会拦你——不主动叫杀、score 为 0，不卡完成度
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("天狼子阴笑道：星宿海你也敢闯？哼，自有师父收拾你。");
};
