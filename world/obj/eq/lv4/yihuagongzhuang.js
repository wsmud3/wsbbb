	this.inherits(EQUIPMENT);
	this.set({
					grade: 4,
					name: "移花宫装",
					desc: "移花宫女弟子的装束，华丽而优雅",
					unit: "件",
					eq_type: EQUIP_TYPE.CLOTH,
					hole_count: 3,
					condition: {
									gender: 2,
					},
					prop: {
									fy: 300,
									max_hp: 1550,
									fy_per: 10,
									per: 5,
					},
	});
