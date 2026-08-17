	this.inherits(COMMAND);
	this.command = "lvliu";
	this.allow_busy = true;
	this.allow_state = true;
	this.allow_die = true;
	this.regex = /^(\w+)(?:\s+(.+))?$/;

	// 兑换价格表
	var SHOP = {
	    xuami:    { cost: 10, name: "玄冥神掌残页" },
	    dye:      { cost: 30, name: "装备染色剂" },
	    box1:     { cost: 20, name: "绿柳藏宝箱(精铁)" },
	    box2:     { cost: 50, name: "绿柳藏宝箱(白银)" },
	    box3:     { cost: 100, name: "绿柳藏宝箱(黄金)" },
	    xuanjing: { cost: 10, name: "玄晶×100" },
	    bp:       { cost: 15, name: "帮派积分×100" },
	};

	// 随机藏宝箱掉落表 普通项为字符串路径，特殊项为{path,count}
	var BOX_DROPS = {
	    box1: ["st/st_blu#4", "st/st_gre#3", "st/st_yel#2", "st/st_red#1", "cash/jing#2", "book/wudao", "drug/limit_mp#2", {path: "st/xuanjing", count: 100}],
	    box2: ["st/st_gre#4", "st/st_red#3", "st/st_yel#3", "st/st_blu#5", "cash/tianshifu", "drug/limit_mp#3", {path: "st/xuanjing", count: 500}],
	    box3: ["st/st_red#4", "st/st_yel#4", "st/st_gre#5", "st/st_blu#6", "cash/xi", "drug/limit_mp#4", {path: "cash/dp", count: 2}, {path: "st/yuanjing", count: 1}],
	};

	this.enter = function (me, cmd, par) {
	    if (!me.is_player) return;
	    if (cmd !== "exchange") return;
	    var item = SHOP[par];
	    if (!item) return me.notify("没有这个商品。可选：xuami/dye/box1/box2/box3/xuanjing/bp");

	    var coin = me.query_temp("lvliu_coin", 0);
	    if (coin < item.cost) return me.notify("绿柳令不足！需要" + item.cost + "枚，当前" + coin + "枚。");

	    me.add_temp("lvliu_coin", -item.cost);
	    coin = me.query_temp("lvliu_coin", 0);

	    switch (par) {
	        case "xuami":
	            var page = me.add_obj("book/bc#xuanmingshenzhang", 1);
	            if (page) me.notify("<hig>你兑换了玄冥神掌残页×1。剩余绿柳令：" + coin + "</hig>");
	            else { me.add_temp("lvliu_coin", item.cost); me.notify("兑换失败，已退款。"); }
	            break;
	        case "dye":
	            var obj = me.add_obj("cash/dye", 1);
	            if (obj) me.notify("<hig>你兑换了装备染色剂×1。剩余绿柳令：" + coin + "</hig>");
	            else { me.add_temp("lvliu_coin", item.cost); me.notify("兑换失败，已退款。"); }
	            break;
	        case "box1":
	        case "box2":
	        case "box3":
	            var drops = BOX_DROPS[par];
	            var drop = drops[Math.floor(Math.random() * drops.length)];
	            var dropPath = typeof drop === "string" ? drop : drop.path;
	            var dropCount = (typeof drop === "object" && drop.count) ? drop.count : 1;
	            var boxItem = me.add_obj(dropPath, dropCount);
	            if (boxItem) me.notify("<hig>你打开" + item.name + "，获得了" + boxItem.color_name + "！剩余绿柳令：" + coin + "</hig>");
	            else { me.add_temp("lvliu_coin", item.cost); me.notify("兑换失败，已退款。"); }
	            break;
	        case "xuanjing":
	            me.add_obj("st/xuanjing", 100);
	            me.notify("<hig>你兑换了玄晶×100。剩余绿柳令：" + coin + "</hig>");
	            break;
	        case "bp":
	            var pt = me.query_party();
	            if (!pt) { me.add_temp("lvliu_coin", item.cost); return me.notify("你还没有加入帮派。"); }
	            pt.add_temp("sc" + Math.min(6, Math.max(1, me.level)), 100);
	            me.notify("<hig>你为帮派贡献了100点活跃度。剩余绿柳令：" + coin + "</hig>");
	            break;
	    }
	};
