this.inherits(NPC);
this.set({
    name: "阿紫",
    desc: "星宿派小师妹，虽是男儿身却喜作女装打扮，妖冶异常。",
    gender: 1,
    age: 20,
    per: 22,
    hp: 357000,
    max_hp: 357000,
    mp: 129000,
    max_mp: 129000,
    score: 0,
    gj: 19921,
    fy: 9083,
    mz: 20362,
    ds: 13503,
    zj: 381
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
    obj: ["eq/lv3/bilinzhen"],
    odds: 300
}, {
    obj: ["book/bc#zhaixinggong"],
    odds: 3000
});
// 攻略第 21 节：此关只需击杀丁春秋和狮吼子，其他人不会拦你——不主动叫杀、score 为 0，不卡完成度
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    me.notify("阿紫掩嘴笑道：又来一个不知死的。想跟本姑娘比划比划么？");
};
// 攻略：可以找他比试，刷玩家自己的五神剑 buff（buff 来自玩家自身技能，不由 NPC 给）。
