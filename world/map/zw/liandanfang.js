this.inherits(ROOM);
this.name = "炼丹房";
this.desc = "一间石室，正中摆放着一座巨大的丹炉，炉中仍有余温。墙上挂着各种草药的图谱，案几上散落着炼丹手札。张三丰晚年曾在此炼丹修心，留下了大量关于真气运转的心得。";
this.exits = { "west": "zw/xuanwuchi" };
this.no_fight = true;

this.add_action("read_notes", "翻阅炼丹手札", function (me) {
    me.notify("\n<hig>你翻阅着张三丰的炼丹手札。</hig>\n\n其中有一页格外引人注目：\n\n「炼丹之道与太极之道相通——火候太过则丹药焦毁，不及则丹不成形。」\n「太极亦是如此。刚过则折，柔过则废。刚柔并济，方为上乘。」\n「……我似乎悟到，太极的真意不在拳法之中。」\n「而在——阴阳转换的那个瞬间。」");
});
