this.inherits(ROOM);
this.name = "无剑虚空";
this.desc = "这不再是你所能理解的任何空间。四周是纯粹的黑暗与寂静，时间和空间在这里失去了意义。唯一的存在是远处一道模糊的人影——他负手而立，一动不动。你看不清他的面容，甚至不确定他是否真实存在。他开口了，声音像是从你心底升起——「一千年了，你是第一个走到这里的人。我一生求一败而不能。但今日，我想先问你一个问题——你，觉得自己能战胜我吗？」";
this.exits = { "south": "jz/wujianshi", "north": "jz/zhongjijiantai" };
this.no_fight = true;

// 机关【无剑胜有】：问心抉择，分两条路线。
//   谦卑线：独孤求败以剑冢四剑的铭文点化（语出《神雕侠侣》），此行到此为止，不领悟无剑；
//           获得「参悟」一小时：悟性 +500，练习、学习、打坐效率 +100%。每日至多点化一次，之后仍可改走骄傲线。
//   骄傲线：当场展开第五关「无剑胜有」化身之战，击败后领悟无剑·无招。
var PZ_KEY = "jz", PZ_ID = 5;
var CANWU_DURATION = 3600000;

function humble(me) {
    if (WORLD.ZHENYI.stage_cleared(me, PZ_KEY, PZ_ID)) return me.notify("人影已不在此处等你。");
    me.notify("\n<hig>独孤求败长叹一声，道：「凌厉刚猛，无坚不摧，弱冠前以之与河朔群雄争锋。紫薇软剑，三十岁前所用，误伤义士不祥，乃弃之深谷。重剑无锋，大巧不工，四十岁前恃之横行天下。四十岁后，不滞于物，草木竹石均可为剑。自此精修，渐进于无剑胜有剑之境。」</hig>\n\n他的身影渐渐淡去，声音却仍在虚空中回荡：「你知己之不足，便已胜过当年的我。回去吧，好生参悟。」");
    if (me.query_temp("jz_canwu_day", 0)) return me.notify("你今日已受过点化，心中所悟尚未消化。");
    me.set_temp("jz_canwu_day", 1, UTIL.diff_time());
    // 存档型限时增益：下线不丢，时间到才消失（见 WORLD.ZHENYI.grant_timed_buff）
    WORLD.ZHENYI.grant_timed_buff(me, "jz_canwu", CANWU_DURATION);
    me.notify("<hic>你获得了「参悟」：一小时内悟性+500，练习、学习、打坐效率提高100%。</hic>");
}
function proud(me) {
    if (WORLD.ZHENYI.stage_cleared(me, PZ_KEY, PZ_ID)) return me.notify("人影已不在此处等你。");
    me.notify("\n<hig>独孤求败仰天大笑：「好！一千年了，总算又有人敢对我拔剑。来——让我看看你的剑！」</hig>");
    WORLD.ZHENYI.solve_puzzle(me, PZ_KEY, PZ_ID, { no_offer: true });
    // 化身之战当场展开；若因精力不足等原因未能开启，北面出口处仍会给出「开启试炼」。
    WORLD.ZHENYI.start_trial(me, PZ_ID);
}
this.add_action("admit_defeat", "坦然道：我不如你", function (me) { humble(me); });
this.add_action("challenge", "拔剑道：我来败你", function (me) { proud(me); });

this.on_leave = function (me, dir) {
    return WORLD.ZHENYI ? WORLD.ZHENYI.puzzle_gate(me, PZ_KEY, PZ_ID, dir) : true;
};
