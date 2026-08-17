	this.inherits(SKILL);
	this.name = "应身报性法";
	this.id = "yingshenbaoxing";
	this.grade = 4;
	this.family = FAMILIES.SUNV;
	this.force_rad = 0.8;
	this.desc = "素女道至高内功心法，以因果报应之理演化为武学，修至极处可引天地之力为己用。修习者容颜不老，气质超凡脱俗";
	this.can_enables = ["force"];
	this.learn_condition = { max_mp: 4000, skill: { force: 400 } };

	this.query_enable_prop = function (lv) {
		return {
			force: {
				max_hp: lv * 25,
				fy: parseInt(lv * 3),
				mz: lv * 2 + 100,
				per: Math.round(lv / 5),
				diff_fy_per: 4,
				limit_mp: lv * 200,
				desc: "将你内力的80%转化为气血",
			}
		};
	}
