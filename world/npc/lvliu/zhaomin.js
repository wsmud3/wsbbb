	this.inherits(NPC);
	this.set({
	    name: "赵敏",
	    desc: "她是绿柳山庄的主人，绍敏郡主。容貌秀丽，眉宇间透着一股英气，嘴角微扬，似笑非笑。",
	    gender: 2,
	    age: 22,
	    per: 30,
	    mp: 999999,
	    max_mp: 999999,
	    hp: 999999,
	    max_hp: 999999,
	    no_fight: true
	});
	this.on_kill = function (me) {
	    return false;
	}
	this.set_objects(["eq/lv0/cloth", 1, 1]);

	this.add_action("talk", "交谈", function (me, par) {
	    var isParty = me.query_temp("pt") ? true : false;
	    if (isParty) {
	        me.notify("<hic>赵敏嫣然一笑：「欢迎来到绿柳山庄。帮派的勇士们，你们能闯到这里，实属不易。若想兑换些物事，尽管开口。」</hic>");
	    } else {
	        me.notify("<hic>赵敏淡淡一笑：「独闯绿柳山庄，勇气可嘉。你若能突破层层关卡，我自会记下你的战绩。」</hic>");
	    }
	});


	this.add_action("stopfb", "结束副本", function (me, par) {
	    var pt = me.query_party();
	    if (!pt) return me.notify("你还没有加入帮派。");
	    var myRole = pt.get_role(me.id);
	    if (!myRole || myRole.level > 2) return me.notify("只有帮主和副帮主才能结束副本。");
	    var task = null;
	    for (var i = 0; i < WORLD.SYSTEMTASKS.length; i++) {
	        if (WORLD.SYSTEMTASKS[i].id === "lvliu_party") { task = WORLD.SYSTEMTASKS[i]; break; }
	    }
	    if (task) task.stop(me);
	});

	this.add_action("progress", "查看进度", function (me, par) {
	    var isParty = me.query_temp("pt") ? true : false;
	    if (isParty) {
	        me.notify("<hic>赵敏道：「帮派副本进度请在帮会管理员处查看。」</hic>");
	    } else {
	        var round = me.query_temp("lvliu_round", 0);
	        var bestRound = me.query_temp("lvliu_best", 0);
	        me.notify("<hic>赵敏翻了翻记录：「你当前已通过" + round + "轮，历史最佳成绩是" + bestRound + "轮。」</hic>");
	    }
	});
