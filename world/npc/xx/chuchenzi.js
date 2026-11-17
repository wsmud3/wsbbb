this.inherits(NPC);
this.set({
    name: "出尘子",
    desc: "星宿派八师兄，身材瘦削，手持碧磷针。",
    gender: 1,
    age: 28,
    per: 8,
    hp: 499800,
    max_hp: 499800,
    mp: 141000,
    max_mp: 141000,
    score: 0,
    gj: 36540,
    fy: 20479,
    mz: 29190,
    ds: 23329,
    zj: 930
});
this.set_objects([
    "eq/lv3/bilinzhen", 1, 1
]);
this.skill_map(
    ["dodge", 1836],
    ["parry", 2116],
    ["force", 1836],
    ["unarmed", 1836]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["eq/lv3/bilinzhen"],
    odds: 8850
}, {
    obj: ["book/bc#feixingshu"],
    odds: 7080
});
// 攻略第 21 节：此关只需击杀丁春秋和狮吼子，其他人不会拦你——不主动叫杀、score 为 0，不卡完成度
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("出尘子尖声道：右星宿海是我和阿紫师妹的地盘……算了，懒得理你。");
};
