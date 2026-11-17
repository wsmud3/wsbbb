	this.inherits(EQUIPMENT);
	this.set({
					grade: 3,
					name: "火龙鞭",
					desc: "赤红色的长鞭，挥舞时如火龙摆尾，鞭梢破空之声宛若龙啸",
					unit: "条",
					eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.WHIP（常量不存在 → 装备栏 undefined，装不上）
					weapon_type: WEAPON_TYPE.WHIP,
					hole_count: 2,
					prop: {
									gj: 380,
									mz: 350,
									dex: 45,
									gjsd_per: 10,
					},
	});
