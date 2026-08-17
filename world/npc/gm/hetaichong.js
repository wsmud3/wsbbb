	this.inherits(NPC);
	this.set({
		name: "何太冲",
		desc: "昆仑派掌门，剑法精妙，为人城府极深。他率昆仑弟子参与围攻光明顶，表面上是除魔卫道，实则暗藏私心，觊觎明教武学已久。",
		title: "<hiy>昆仑掌门</hiy>",
		gender: 1,
		age: 50,
		per: 15,
		hp: 470000,
		max_hp: 470000,
		mp: 106000,
		max_mp: 106000,
		score: 61,
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
		me.notify("何太冲冷笑一声：'来的正好，昆仑剑下不死无名之鬼！'");
		this.do_kill(me);
	};
	this.on_die = function (killer) {
		if (killer && killer.is_player) {
			var cur = killer.query_temp("gm_gates_clear") || 0;
			killer.set_temp("gm_gates_clear", cur + 1);
			killer.notify("<hiy>你击败了昆仑派高手！六派已破" + (cur + 1) + "/6。</hiy>");
			if (cur + 1 >= 6) {
				killer.notify("<hio>六派高手尽数败退，光明顶大殿的入口已经开启！</hio>");
			}
		}
	};
