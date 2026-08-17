this.inherits(SKILL);
this.name = "天南步";
this.id = "tiannanbu";
this.grade = 2;
this.desc = "大理段氏独门步法，灵巧多变";
this.can_enables = ["dodge"];
this.learn_condition = {
		max_mp: 2000,
		skill: { dodge: 200 }
	};

this.query_enable_prop = function (lv) {
		return {
			dodge: {
				ds: parseInt(lv * 1.6) + 30,
				int: parseInt(lv * 166.0 / 1000),
			},
		}
	};

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
