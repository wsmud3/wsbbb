	this.inherits(EQUIPMENT);
	this.set({
					unit: "件",
					name: "银月珠钗",
					desc: "素女道专属装备，精工细作，蕴含玄阴之气。",
					grade: 3,
					eq_type: EQUIP_TYPE.HEAD,
					hole_count: 3,
					prop: { mz: 30, int: 8, per: 3 }
	});
	this.family = FAMILIES.SUNV;
// 容貌不随精炼成长
this.fixed_props = ["per"];
