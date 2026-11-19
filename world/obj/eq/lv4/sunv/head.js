	this.inherits(EQUIPMENT);
	this.set({
					unit: "件",
					name: "凤鸣金簪",
					desc: "素女道专属装备，精工细作，蕴含玄阴之气。",
					grade: 4,
					eq_type: EQUIP_TYPE.HEAD,
					hole_count: 4,
					prop: { mz: 50, int: 12, per: 5 }
	});
	this.family = FAMILIES.SUNV;
// 容貌不随精炼成长
this.fixed_props = ["per"];
