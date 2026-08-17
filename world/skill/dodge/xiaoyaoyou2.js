	this.inherits(SKILL);
	this.name = "逍遥游";
	this.id = "xiaoyaoyou2";
	this.source_skill = "xiaoyaoyou";
	this.grade = 4;
	this.family = FAMILIES.GAIBANG;
	this.dodge_actions = [
		"$n一个「蜻蜓点水」，躲过了$N这一招。",
		"$n身形向后一纵，使出一招「细胸巧翻云」，避过了$N的攻击。",
		"$n使出「虚怀若谷」，恰好躲过了$N的攻势。",
		"但是$n身形飘忽，轻轻一纵，早已避开。",
		"$n身形微晃，有惊无险地避开了$N这一招。",
		"$n长袖一拂，身如闲云野鹤般向后飘出数丈，姿态潇洒之极，$N的杀招尽数落空。",
		"$n使出一式「乘风归去」，足尖在$N的兵刃上轻轻一点，借力腾空而起，宛若仙人飞升。",
		"$n哈哈一笑，身形如惊鸿掠过水面，脚下步法洋洋洒洒、全无章法，却偏偏每一步都踏在$N攻击的间隙之中。"
];
	this.can_enables = ["dodge"];
	this.learn_condition = {
		max_mp: 4000,
		skill: { dodge: 400 }
	};
	this.query_enable_prop = function (lv) {
		return {
		dodge: {
				ds: parseInt(lv * 1.8) + 30,
				mz: parseInt(lv * 1.6) + 30,
				str: parseInt(lv * 253.0 / 1000),
		},
		}
	};

	this.pfm = {
		lingbo:
		{
		name: "仙游",
		distime: 30000,
		enable_skill: "dodge",
		mp: 20,
		release_time: 0,
		use: function (me, target, lv) {

				var gj = lv * 10 + 10000;

				me.add_status({
				id: "dodge",
				name: "仙游",
				start_msg: "<hiw>$N身子微晃，衣袂飘飘，施出「<hig>仙游诀</hig>」满场游走。只见$N步法洋洋洒洒，时而如流水行云，时而如飞鸿踏雪，身形潇洒飘逸之极，仿佛已超然物外，与天地融为一体。</hiw>",
				desc: "逍遥游之仙游决，增加你的命中",
				duration: gj,
				prop: {
					mz: lv
				}
			});
		},
		query_desc: function (me, lv) {
				var gj = lv * 10 + 10000;
				return "仙游诀——在" + (gj / 1000) + "秒内增加你" + lv + "点命中。";
		}
	}
}
