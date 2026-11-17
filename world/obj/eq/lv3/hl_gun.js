	this.inherits(EQUIPMENT);
	this.set({
					grade: 3,
					name: "火龙棍",
					desc: "棍身修长，两端各刻一火龙首，舞动时虎虎生风，力道雄浑",
					unit: "根",
					eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.STAFF（常量不存在 → 装备栏 undefined，装不上）
					weapon_type: WEAPON_TYPE.STAFF,
					hole_count: 2,
					prop: {
									gj: 410,
									mz: 310,
									str: 48,
									zj_per: 8,
					},
	});
