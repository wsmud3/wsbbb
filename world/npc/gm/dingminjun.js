	this.inherits(NPC);
	this.set({
		name: "丁敏君",
		desc: "峨嵋派弟子，灭绝师太的得意门生。她剑法凌厉，性格刚烈，对明教恨之入骨。此次随师父前来围攻光明顶，誓要为纪晓芙师姐报仇雪恨。",
		title: "峨嵋派高手",
		gender: 2,
		age: 28,
		per: 17,
		hp: 455000,
		max_hp: 455000,
		mp: 102000,
		max_mp: 102000,
		score: 0,
		gj: 54480,
		fy: 28679,
		mz: 46080,
		ds: 24617,
		zj: 1600
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
		["dodge", 2137],
		["parry", 2040],
		["force", 2137],
		["sword", 2137]
	);
	this.set_drop(
		{obj: "money/silver", min: 10, max: 100},
		{obj: ["book/bc#yingzhuagong"], odds: 9040}
	);
	this.on_enter = function (me) {
		me.notify("丁敏君拔剑怒喝：'魔教妖人，纳命来！'");
		this.do_kill(me);
	};
	// 未投放到任何房间（攻略的光明顶没有六派高手关卡）。原 on_die 用 me.set_temp 记「六派已破 n/6」
	// 但没有任何地方读取，属于死代码，已删除。
