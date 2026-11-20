this.inherits(ROOM);
this.name = "无剑虚空";
this.desc = "这不再是你所能理解的任何空间。四周是纯粹的黑暗与寂静，时间和空间在这里失去了意义。唯一的存在是远处一道模糊的人影——他负手而立，一动不动。你看不清他的面容，甚至不确定他是否真实存在。他开口了，声音像是从你心底升起——「一千年了，你是第一个走到这里的人。我一生求一败而不能。但今日，我想先问你一个问题——你，觉得自己能战胜我吗？」";
this.exits = { "south": "jz/wujianshi", "north": "jz/zhongjijiantai" };
this.no_fight = true;

// 机关【无剑胜有】：问心抉择。
//   谦卑：化身气血 100%（若在悟剑石参悟后再谦卑，心境更稳，化身气血 90%）
//   骄傲：化身气血 120%
var PZ_KEY = "jz", PZ_ID = 5;

function choose(me, humble) {
    var data = WORLD.ZHENYI.find_by_key(PZ_KEY);
    if (WORLD.ZHENYI.stage_cleared(me, PZ_KEY, PZ_ID)) return me.notify("人影已不在此处等你。");
    if (humble) {
        var calm = !!me.query_temp("jz_meditate_done");
        me.notify("\n<hig>独孤求败微微点头：「知耻近乎勇。" + (calm ? "你在悟剑石前静坐良久，心境比来时稳了许多。" : "你已悟得剑道第一义。") + "」</hig>");
        WORLD.ZHENYI.solve_puzzle(me, PZ_KEY, PZ_ID, { hp: calm ? 90 : 100 });
    } else {
        me.notify("\n<hig>独孤求败大笑：「无谓的勇气。看来你还没明白——但这般锐气，倒也有趣。来吧。」</hig>");
        WORLD.ZHENYI.solve_puzzle(me, PZ_KEY, PZ_ID, { hp: 120 });
    }
}
this.add_action("admit_defeat", "坦然道：我不如你", function (me) { choose(me, true); });
this.add_action("challenge", "拔剑道：我来败你", function (me) { choose(me, false); });

this.on_leave = function (me, dir) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.puzzle_gate(me, PZ_KEY, PZ_ID, dir) : true;
};
