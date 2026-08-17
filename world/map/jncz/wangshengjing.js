this.inherits(ROOM);
this.name = "往生径";
this.desc = "一条幽暗潮湿的地底石径，两侧岩壁上爬满了发光的苔藓，散发出诡异的幽绿色微光。地面上布满了锋利的碎石和不知名的骨骸，空气中弥漫着腐朽与檀香混合的奇异气味。远处隐约传来梵唱声和若有若无的叹息。";
this.exits = { "west": "jncz/houshanya", "east": "jncz/wenxintai" };
this.set_npc([]);

// 陷阱：踏入时受到割裂伤害
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("jncz_wangsheng_passed")) return;
    var bleedDmg = 300000;
    me.damage2(bleedDmg, null);
    me.notify("<red>碎石割裂了你的双腿，鲜血染红了石径，你受到" + bleedDmg + "点伤害！</red>");
    me.notify("<hiy>你强忍剧痛继续前行。这条往生之路，才刚刚开始……</hiy>");
    me.set_temp("jncz_wangsheng_passed", 1);
};

this.add_action("climb_back", "原路返回", function (me) {
    me.notify("<hiy>你沿着来路攀爬而上，回到了后山崖。</hiy>");
    me.moveto("jncz/houshanya");
    return true;
});
