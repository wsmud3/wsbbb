	this.inherits(NPC);
	this.set({
		name: "何太冲",
		desc: "昆仑派掌门，剑法精妙，为人城府极深。他率昆仑弟子参与围攻光明顶，表面上是除魔卫道，实则暗藏私心，觊觎明教武学已久。",
		title: "昆仑掌门",
		gender: 1,
		age: 50,
		per: 15,
		hp: 470000,
		max_hp: 470000,
		mp: 106000,
		max_mp: 106000,
		score: 0,
		gj: 55480,
		fy: 29379,
		mz: 46580,
		ds: 25117,
		zj: 1630
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
		["dodge", 2147],
		["parry", 2058],
		["force", 2147],
		["sword", 2147],
		["unarmed", 2147]
	);
	this.set_drop(
		{obj: "money/silver", min: 10, max: 100},
		{obj: ["book/bc#qiankundanuoyi"], odds: 9040}
	);
	this.on_enter = function (me) {
		me.notify("何太冲冷笑一声：「来的正好，昆仑剑下不死无名之鬼！」");
		this.do_kill(me);
	};
	// 未投放到任何房间（攻略的光明顶没有六派高手关卡）。原 on_die 用 me.set_temp 记「六派已破 n/6」
	// 但没有任何地方读取，属于死代码，已删除。
