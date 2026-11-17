	this.inherits(EQUIPMENT);
	this.set({
					grade: 3,
					name: "金蛇剑",
					desc: "剑身弯曲如金蛇蜿蜒，剑尖分叉如蛇信，锋利异常，传闻为金蛇郎君夏雪宜的佩剑",
					unit: "把",
					eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.SWORD（常量不存在 → 装备栏 undefined，装不上）
					weapon_type: WEAPON_TYPE.SWORD,
					hole_count: 2,
					prop: {
									gj: 88,
									dex: 10,
									bj_per: 2,
					},
	});
