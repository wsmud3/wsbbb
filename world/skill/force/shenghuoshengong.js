this.inherits(SKILL);
this.name = "圣火神功";
this.id = "shenghuoshengong";
this.grade = 3;
this.force_rad = 0.7;
this.desc = "圣火神功";
this.can_enables = ["force"];
this.learn_condition = {
	max_mp: 3000,
	skill: { force: 300 }
};
this.query_enable_prop = function (lv) {
	return {
		force: {
			max_hp: lv * 15,
			fy: lv * 1,
			limit_mp: lv * 100,
			desc: "唯一：将你内力的70%转化为气血",
		}
	};
}
this.pfm = {
	pfm1: {
		name: "圣火护体",
		distime: 60000,
		enable_skill: "force",
		mp: 25,
		use: function (me, target, lv) {
			me.send_room("<HIR>$N双手结印，圣火神功内力如烈焰般燃起——「圣火护体」！$N周身火光缭绕，攻防之力在圣火加持下大幅提升！</HIR>", me);
			me.add_status({
				id: "shenghuo",
				name: "圣火",
				desc: "攻击和防御增加" + (10 + parseInt(lv / 100)) + "%",
				duration: 10000 + parseInt(lv * 10),
				prop: { gj_per: 10 + parseInt(lv / 100), fy_per: 10 + parseInt(lv / 100) },
			})},
		query_desc: function (me, lv) {
			return "增加自身防御，" + (10 + parseInt(lv * 10 / 1000)) + "秒内提升自身，攻击防御" + (10 + parseInt(lv / 100)) + "%。";
		}
	}
};
