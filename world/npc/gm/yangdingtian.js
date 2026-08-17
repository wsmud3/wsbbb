	this.inherits(NPC);
	this.set({
		name: "阳顶天",
		desc: "明教前教主，武功深不可测，乾坤大挪移已修炼至第六层。虽已年迈，但其内力之深厚当世罕有其匹。他镇守光明顶大殿多年，是明教最后的守护者。",
		title: "<hiy>明教前教主</hiy>",
		gender: 1,
		age: 70,
		per: 18,
		hp: 1052800,
		max_hp: 1052800,
		mp: 220000,
		max_mp: 220000,
		score: 95,
		gj: 70480,
		fy: 45014,
		mz: 78240,
		ds: 50760,
		zj: 2470
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
		["dodge", 2704],
		["parry", 2520],
		["force", 2608],
		["unarmed", 2608],
		["shenghuolingfa", 2520, "unarmed"],
		["qiankundanuoyi", 2704, "parry"],
		["jiuyangshengong", 2608, "force"]
	);
	this.set_drop(
		{obj: "money/silver", min: 50, max: 500},
		{obj: ["book/bc#qiankundanuoyi"], odds: 11300},
		{obj: ["book/bc#shenghuolingfa"], odds: 11300},
		{obj: ["eq/lv4/shenghuoling"], odds: 6780}
	);
	this.on_enter = function (me) {
		me.notify("阳顶天缓缓睁开双眼，沉声道：'老夫镇守此处数十载，今日岂容你放肆！乾坤大挪移！'");
		this.do_kill(me);
	};
