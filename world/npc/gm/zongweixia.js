	this.inherits(NPC);
	this.set({
		name: "宗维侠",
		desc: "崆峒五老之一，七伤拳威震西域。他脾气暴躁，性如烈火，此次围攻光明顶，誓要亲手击毙几个魔教高手以扬崆峒之威。",
		title: "崆峒长老",
		gender: 1,
		age: 52,
		per: 13,
		hp: 475000,
		max_hp: 475000,
		mp: 104000,
		max_mp: 104000,
		score: 0,
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
	// 未投放到任何房间（攻略的光明顶没有六派高手关卡）。原 on_die 用 me.set_temp 记「六派已破 n/6」
	// 但没有任何地方读取，属于死代码，已删除。
