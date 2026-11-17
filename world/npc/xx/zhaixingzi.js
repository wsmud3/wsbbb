this.inherits(NPC);
this.set({
    name: "摘星子",
    desc: "星宿派大师兄，武功为众弟子之首，飞星术出神入化。",
    gender: 1,
    age: 32,
    per: 10,
    hp: 735000,
    max_hp: 735000,
    mp: 154400,
    max_mp: 154400,
    score: 0,
    gj: 22519,
    fy: 16340,
    mz: 29244,
    ds: 18028,
    zj: 533
});
this.skill_map(
    ["dodge", 2409],
    ["parry", 2332],
    ["force", 2409],
    ["unarmed", 2409],
    ["feixingshu", 2409, "unarmed"],
    ["zhaixinggong", 2409, "dodge"],
    ["huagongdafa", 2332, "force"]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#feixingshu", "book/bc#zhaixinggong"],
    odds: 3000
}, {
    obj: ["book/bc#huagongdafa"],
    odds: 3000
});
// 攻略第 21 节：此关只需击杀丁春秋和狮吼子，其他人不会拦你——不主动叫杀、score 为 0，不卡完成度
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("摘星子斜眼打量了你一番，冷冷哼了一声，并不理会。");
};
