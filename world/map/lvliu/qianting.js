	this.inherits(ROOM);
	this.name = "前厅"
	this.desc = "这是绿柳山庄的前厅，装饰典雅华贵。正中一幅山水画，两侧摆放着红木座椅。厅中一位女子正端坐品茶，正是此间主人——赵敏。";
	this.exits = { "south": "lvliu/menqian", "north": "lvliu/zoulang1" };
	this.no_fight = true;
	this.set_npc("lvliu/zhaomin");

	// 房间级兑换操作（避免NPC copy问题）
	this.add_action("lvliu_shop", "兑换物品", function (me) {
	    var coin = me.query_temp("lvliu_coin", 0);
	    me.send("<hic>赵敏道：你当前有" + coin + "枚绿柳令。</hic>\n可兑换物品：\n  <hio>玄冥神掌残页</hio> - 10令\n  装备染色剂 - 30令\n  绿柳藏宝箱(精铁) - 20令（随机奖励）\n  绿柳藏宝箱(白银) - 50令（随机奖励）\n  绿柳藏宝箱(黄金) - 100令（随机奖励）\n  玄晶×100 - 10令\n  帮派积分×100 - 15令");
	    me.send_commands(
	        "lvliu exchange xuami", "玄冥神掌残页(10令)",
	        "lvliu exchange dye", "装备染色剂(30令)",
	        "lvliu exchange box1", "绿柳藏宝箱·精铁(20令)",
	        "lvliu exchange box2", "绿柳藏宝箱·白银(50令)",
	        "lvliu exchange box3", "绿柳藏宝箱·黄金(100令)",
	        "lvliu exchange xuanjing", "玄晶×100(10令)",
	        "lvliu exchange bp", "帮派积分×100(15令)"
	    );
	});
