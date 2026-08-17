	this.inherits(SKILL);
	this.name = "素女剑法";
	this.id = "sunvjianfa";
	this.grade = 1;
	this.family = FAMILIES.SUNV;
	this.desc = "素女道入门剑法，剑势柔美中暗藏杀机，以巧破力";
	this.can_enables = ["sword"];
	this.learn_condition = { max_mp: 25, skill: { sword: 50 } };
	this.query_enable_prop = function (lv) { return { sword: { gj: lv + 8, mz: Math.round(lv / 5) } }; };
