	this.inherits(EQUIPMENT);
	this.set({
					grade: 3,
					name: "火龙剑",
					desc: "剑身狭长，剑脊一道火红纹路如龙脊蜿蜒，出剑时隐隐有龙吟之声",
					unit: "把",
					eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.SWORD（常量不存在 → 装备栏 undefined，装不上）
					weapon_type: WEAPON_TYPE.SWORD,
					hole_count: 2,
					prop: {
									gj: 420,
									mz: 370,
									dex: 45,
									mz_per: 6,
									bj_per: 4,
					},
	});
