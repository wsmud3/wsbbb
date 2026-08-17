	this.inherits(NPC);
	this.set({
		name: "宋远桥",
		desc: "武当七侠之首，张三丰座下大弟子。他为人谦和稳重，剑法与掌法俱精，此次奉命率武当弟子前来围攻光明顶，虽不情愿但也只得遵从师命。",
		title: "<hiy>武当七侠之首</hiy>",
		gender: 1,
		age: 48,
		per: 18,
		hp: 465000,
		max_hp: 465000,
		mp: 108000,
		max_mp: 108000,
		score: 61,
		gj: 54480,
		fy: 30279,
		mz: 46080,
		ds: 25617,
		zj: 1620
	});
	this.set_objects(["eq/lv0/cloth", 1, 1]);
	this.skill_map(
		["dodge", 2140],
		["parry", 2080],
		["force", 2140],
		["sword", 2140],
		["unarmed", 2140]
	);
	this.set_drop(
		{obj: "money/silver", min: 10, max: 100},
		{obj: ["book/bc#shenghuolingfa"], odds: 9040}
	);
	this.on_enter = function (me) {
		me.notify("宋远桥长剑出鞘，叹道：'武当本不愿多造杀孽，但今日既已至此，便由不得你了！'");
		this.do_kill(me);
	};
	this.on_die = function (killer) {
		if (killer && killer.is_player) {
			var cur = killer.query_temp("gm_gates_clear") || 0;
			killer.set_temp("gm_gates_clear", cur + 1);
			killer.notify("<hiy>你击败了武当派高手！六派已破" + (cur + 1) + "/6。</hiy>");
			if (cur + 1 >= 6) {
				killer.notify("<hio>六派高手尽数败退，光明顶大殿的入口已经开启！</hio>");
			}
		}
	};
