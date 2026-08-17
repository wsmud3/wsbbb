this.inherits(ROOM);
this.name = "太极闭关洞";
this.desc = "天柱峰内的一个小小的石窟。洞中只有一席蒲团、一盏油灯、一面石壁。石壁上干干净净，没有刻字、没有剑痕——只有一行沧桑的指书：「此处闭关七载，终于悟得——太极无疆。」这就是张三丰晚年的闭关之处。";
this.exits = { "south": "zw/tianzhufeng", "north": "zw/taijihuashentai" };
this.no_fight = true;

this.add_action("meditate", "在蒲团上打坐", function (me) {
    if (me.query_temp("zw_meditated")) return me.notify("你已经在此打坐过了。");
    me.set_temp("zw_meditated", 1);
    me.notify("<hig>你在张三丰曾经打坐的蒲团上盘膝坐下。洞中七年的寂静仿佛穿越时光降临——你感受到了「太极无疆」的境界碎片。在最终战中，你的太极真意效果将得到增强。</hig>");
});
