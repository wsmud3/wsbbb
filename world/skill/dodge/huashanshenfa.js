this.inherits(SKILL);
this.name = "华山身法";
this.id = "huashanshenfa";
this.grade = 1;
this.desc = "华山派轻功身法，以险峻著称";
this.can_enables = ["dodge"];
this.learn_condition = {
		skill: {
		dodge: 100
	}
};
this.query_enable_prop = function (lv) {
		return {
		dodge: {
			ds: lv * 2,
			mz: lv * 1.5
		}
	};
}

this.query_dodge_action = function() {
		return this.dodge_actions.random();
	};
this.dodge_actions = [
		"$n身形一晃，$N的攻击已然落空。",
		"$n足尖轻点，向后跃开，$N这一招扑了个空。",
		"$n一个「旱地拔葱」，身体向上笔直地纵起丈余，躲过了$N这一招。",
		"$n往后一纵，$N的攻击差之毫厘。",
		"$n身子一侧，$N的攻击擦身而过。",
		"$n陡然变招，$N的攻击被轻松化解。"
	];
