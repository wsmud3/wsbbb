	this.inherits(EQUIPMENT);
	this.set({
					grade: 3,
					name: "火龙刀",
					desc: "刀身赤红如烈焰，刻有火龙盘绕之纹，舞动时热浪灼人，似有火龙附体",
					unit: "把",
					eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.BLADE（常量不存在 → 装备栏 undefined，装不上）
					weapon_type: WEAPON_TYPE.BLADE,
					hole_count: 2,
					prop: {
									gj: 440,
									mz: 320,
									str: 40,
									bj_per: 6,
									add_sh_per: 4,
					},
	});
