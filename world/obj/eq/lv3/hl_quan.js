	this.inherits(EQUIPMENT);
	this.set({
					grade: 3,
					name: "火龙拳",
					desc: "精铁铸造的拳套，指节处嵌有火红宝石，握拳时热力四射，拳风如龙",
					unit: "只",
					eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.GLOVE（常量不存在 → 装备栏 undefined，装不上）
					weapon_type: WEAPON_TYPE.NONE,
					hole_count: 2,
					prop: {
									gj: 400,
									str: 50,
									add_sh_per: 6,
									bj_per: 5,
					},
	});
