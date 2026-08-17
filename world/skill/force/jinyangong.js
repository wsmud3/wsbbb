this.inherits(SKILL);
this.name = "金雁功";
this.id = "jinyangong";
this.grade = 1;
this.desc = "全真教内功心法，以轻灵飘逸见长，内力与轻功并重";
this.can_enables = ["dodge"];

this.query_enable_prop = function (lv) {
		return {
			dodge: {
				ds: lv * 1,
			},
		}
	};
