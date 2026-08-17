	this.inherits(SKILL);
	this.name = "素女心法";
	this.id = "sunvxinfa";
	this.grade = 1;
	this.family = FAMILIES.SUNV;
	this.desc = "素女道入门内功心法，调和阴阳，滋养经脉";
	this.can_enables = ["force"];
	this.learn_condition = { max_mp: 30, skill: { force: 50 } };
	this.query_enable_prop = function (lv) { return { force: { max_hp: lv * 8, fy: parseInt(lv * 1.2) } }; };
