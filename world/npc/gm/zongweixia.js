	this.inherits(NPC);
	this.set({
		name: "宗维侠",
		desc: "崆峒五老之一，七伤拳威震西域。他脾气暴躁，性如烈火，此次围攻光明顶，誓要亲手击毙几个魔教高手以扬崆峒之威。",
		title: "<hiy>崆峒长老</hiy>",
		gender: 1,
		age: 52,
		per: 13,
		hp: 475000,
		max_hp: 475000,
		mp: 104000,
		max_mp: 104000,
		score: 61,
		gj: 56480,
		fy: 28979,
		mz: 45580,
		ds: 24017,
		zj: 1640
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
		["dodge", 2130],
		["parry", 2050],
		["force", 2150],
		["unarmed", 2150]
	);
	this.set_drop(
		{obj: "money/silver", min: 10, max: 100},
		{obj: ["book/bc#shenghuoshengong"], odds: 9040}
	);
	this.on_enter = function (me) {
		me.notify("宗维侠双拳一振，喝道：'七伤拳下，无所不伤！接招！'");
		this.do_kill(me);
	};
	this.on_die = function (killer) {
		if (killer && killer.is_player) {
			var cur = killer.query_temp("gm_gates_clear") || 0;
			killer.set_temp("gm_gates_clear", cur + 1);
			killer.notify("<hiy>你击败了崆峒派高手！六派已破" + (cur + 1) + "/6。</hiy>");
			if (cur + 1 >= 6) {
				killer.notify("<hio>六派高手尽数败退，光明顶大殿的入口已经开启！</hio>");
			}
		}
	};
