	this.inherits(EQUIPMENT);
	this.set({
					unit: "件",
					name: "九天玄女冠",
					desc: "素女道专属装备，精工细作，蕴含玄阴之气。",
					grade: 5,
					eq_type: EQUIP_TYPE.HEAD,
					hole_count: 5,
					prop: { mz: 75, int: 18, per: 8 }
	});
	this.family = FAMILIES.SUNV;
// 容貌不随精炼成长
this.fixed_props = ["per"];
