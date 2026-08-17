	this.inherits(EQUIPMENT);
	this.set({
					grade: 4,
					name: "东方不败的绣花针",
					desc: "只是一根简单的绣花针，却使人感到剑气森森，不寒而栗",
					unit: "根",
					eq_type: EQUIP_TYPE.SWORD,
					weapon_type: WEAPON_TYPE.SWORD,
					hole_count: 3,
					prop: {
									gj: 250,
									gjsd_per: 20,
									bj_per: 5,
									diff_fy_per: 10,
									skill: {
													pixiejianfa: 100,
													kuihuashengong: 100,
									},
					},
	});
