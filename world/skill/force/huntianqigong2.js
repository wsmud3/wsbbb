this.inherits(SKILL);
this.name = "混元天罡";
this.id = "huntianqigong2";
this.source_skill = "huntianqigong";
this.grade = 4;
this.force_rad = 0.7;
this.desc = "丐帮的至高内功心法";
this.family = FAMILIES.GAIBANG;
this.can_enables = ["force"];
this.learn_condition = {
	max_mp: 4000,
	skill: { force: 400 }
};
this.query_enable_prop = function (lv) {
	return {
								force: {
			gj: 2020,
			con: 254,
			fy: 2030,
			limit_mp: 158000,
			desc: "唯一：将你内力的70%转化为气血"
								}
	};
}
this.pfm = {
	power:
	{
								name: "天罡",
								distime: 60000,
								enable_skill: "force",
								mp: 20,
								use_type: 2,
								release_time: 0,
								use: function (me, target, lv) {
			me.send_room("<HIy>$N气沉丹田，大喝一声，混元天罡真气如惊涛骇浪般自体内爆发而出！只见$N周身真气鼓荡，衣袍猎猎作响，一股至阳至刚的罡气在$N体表凝成一层淡金色的护体气罩，坚不可摧、威不可挡！</HIy>");
			me.add_status({
																id: "force",
																name: "天罡",
																desc: "增加攻击和防御",
																prop: {
																				fy_per: 10 + parseInt(lv / 100),
																				gj_per: 10 + parseInt(lv / 100)
																},
																duration: 25000 + parseInt(lv * 10)
												});
								},
								query_desc: function (me, lv) {
			return "天罡——" + (25 + parseInt(lv * 10 / 1000)) + "秒内提升自身攻击防御" + (10 + parseInt(lv / 100)) + "%。";
								}
				}
};
