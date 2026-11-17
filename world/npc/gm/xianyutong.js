	this.inherits(NPC);
	this.set({
		name: "鲜于通",
		desc: "华山派掌门，武功智计皆属上乘，但为人阴险狡诈。他率华山弟子参与围攻光明顶，表面上是为武林除害，实则为扬名立万，觊觎那武林盟主之位。",
		title: "华山掌门",
		gender: 1,
		age: 45,
		per: 16,
		hp: 460000,
		max_hp: 460000,
		mp: 107000,
		max_mp: 107000,
		score: 0,
		gj: 54480,
		fy: 29579,
		mz: 46880,
		ds: 24817,
		zj: 1625
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
		["dodge", 2157],
		["parry", 2037],
		["force", 2157],
		["sword", 2157]
	);
	this.set_drop(
		{obj: "money/silver", min: 10, max: 100},
		{obj: ["book/bc#jiuyangshengong"], odds: 3000}
	);
	this.on_enter = function (me) {
		me.notify("鲜于通手中折扇一收，冷笑道：「区区小辈也敢闯我华山营地，今日便拿你祭旗！」");
		this.do_kill(me);
	};
	// 未投放到任何房间（攻略的光明顶没有六派高手关卡）。原 on_die 用 me.set_temp 记「六派已破 n/6」
	// 但没有任何地方读取，属于死代码，已删除。
