	this.inherits(EQUIPMENT);
	this.set({
					grade: 3,
					name: "五岳令旗",
					desc: "五岳剑派盟主的信物，旗杆为精铁所铸，旗面绣有五岳山势图，挥动时如剑锋凌厉",
					unit: "面",
					eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.SWORD（常量不存在 → 装备栏 undefined，装不上）
					weapon_type: WEAPON_TYPE.SWORD,
					hole_count: 2,
					prop: {
									gj: 120,
									str: 12,
									limit_mp: 1000,
					},
	});
