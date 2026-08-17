this.inherits(SKILL);
this.name = "五毒神功";
this.id = "wudushengong";
this.grade = 2;
this.force_rad = 0.7;
this.desc = "五毒教独门内功，以毒练功，一身是毒";
this.can_enables = ["force"];
this.learn_condition = {
		max_mp: 2000,
		skill: { force: 200 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				max_hp: lv * 8,
				fy: lv * 1,
				limit_mp: lv * 55,
				desc: "唯一：将你内力的70%转化为气血"
			},
		}
	};
