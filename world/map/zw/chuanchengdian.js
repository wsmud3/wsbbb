this.inherits(ROOM);
this.name = "真武传承殿";
this.desc = "张三丰的太极化身消散后，一座石殿从虚空中显现。殿正中悬浮着一枚太极玉符——玉符中封存着张三丰对太极之道的全部领悟。石壁上刻着他的最后一句话：「太极者，无极而生。动静之机，阴阳之母。这是我唯一能留给你们的——太极真意。」";
this.exits = { "south": "zw/taijihuashentai" };
this.no_fight = true;

this.on_enter = function (me) {
    var count = me.add_temp("zw_complete", 1);
    if (count === 1) {
        me.notify("\n<hig>张三丰的声音在你心中响起：「好。太极后继有人。」</hig>\n\n恭喜你！你是第一个踏破真武秘境八门阵法的武当弟子！");
    }
    me.add_temp("zw_mark", 3);
    me.notify("<hig>你获得了 3 枚太极真印。</hig>");
};

this.add_action("shop", "兑换奖励", function (me) {
    var marks = me.query_temp("zw_mark", 0);
    me.notify("\n<hig>真武传承殿 · 兑换</hig>\n当前太极真印：<hic>" + marks + "</hic>\n\n可兑换物品：\n  <hio>元晶×100</hio> — 1印\n  lv3宝石自选包×10 — 2印\n  太极拳经残页×50 — 3印\n  太极符·精炼 — 5印\n  称号「太极传人」— 15印\n  称号「太极宗师」— 40印");
    me.send_commands(
        "zw exchange yuanjing", "元晶×100(1印)",
        "zw exchange gem", "lv3宝石自选包×10(2印)",
        "zw exchange skill", "太极拳经残页×50(3印)",
        "zw exchange jly", "太极符·精炼(5印)",
        "zw exchange title1", "称号「太极传人」(15印)",
        "zw exchange title2", "称号「太极宗师」(40印)"
    );
});
