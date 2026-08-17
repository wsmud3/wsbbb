	this.inherits(EQUIPMENT);
	this.set({
					grade: 4,
					name: "软猬甲",
					desc: "是黄药师送给妻子冯氏的定情之物",
					unit: "件",
					eq_type: EQUIP_TYPE.CLOTH,
					hole_count: 3,
					prop: {
									fy: 250,
									dex: 22,
									diff_sh_per: 8,
					},
	});

	// 受到攻击后反弹一部分伤害，冷却3秒
	this._ruanjia_cd = 0;
	this.on_defense = function (me, from, sh) {
					if (sh > 0 && from && from.hp > 0) {
									var now = Date.now();
									if (now >= this._ruanjia_cd) {
													this._ruanjia_cd = now + 3000;
													var reflectDmg = Math.floor(sh * 0.3);
													if (reflectDmg > 0) {
																	from.damage(reflectDmg, me, 0);
																	me.send_combat("<HIY>$N身上的软猬甲倒刺反弹，对$n造成了" + reflectDmg + "点伤害！</HIY>\n", from);
													}
									}
					}
					return sh;
	};
