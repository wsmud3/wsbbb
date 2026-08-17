	this.inherits(NPC);
	this.set({
		name: "空智",
		desc: "少林派神僧，武功卓绝，此次率领少林弟子围攻光明顶。他一身少林绝技已臻化境，龙爪手刚猛无匹，佛法与武学俱是当世一流。",
		title: "<hiy>少林神僧</hiy>",
		gender: 1,
		age: 55,
		per: 16,
		hp: 480000,
		max_hp: 480000,
		mp: 105000,
		max_mp: 105000,
		score: 62,
		gj: 55480,
		fy: 29679,
		mz: 47080,
		ds: 24617,
		zj: 1650
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
		["dodge", 2157],
		["parry", 2050],
		["force", 2157],
		["unarmed", 2157]
	);
	this.set_drop(
		{obj: "money/silver", min: 10, max: 100},
		{obj: ["book/bc#shenghuoshengong"], odds: 9040}
	);
	this.on_enter = function (me) {
		me.notify("空智双掌合十，沉声道：'阿弥陀佛！魔教妖人，还不束手就擒！'");
		this.do_kill(me);
	};
	this.on_die = function (killer) {
		if (killer && killer.is_player) {
			var cur = killer.query_temp("gm_gates_clear") || 0;
			killer.set_temp("gm_gates_clear", cur + 1);
			killer.notify("<hiy>你击败了少林派高手！六派已破" + (cur + 1) + "/6。</hiy>");
			if (cur + 1 >= 6) {
				killer.notify("<hio>六派高手尽数败退，光明顶大殿的入口已经开启！</hio>");
			}
		}
	};
