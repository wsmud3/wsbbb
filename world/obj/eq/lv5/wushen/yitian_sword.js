this.inherits(EQUIPMENT);
this.set({
				grade: 5,
				name: "倚天剑",
				desc: "武林至尊，宝刀屠龙。号令天下，莫敢不从。倚天不出，谁与争锋！这就是号令天下的倚天剑",
				unit: "把",
				eq_type: EQUIP_TYPE.SWORD,
				weapon_type: WEAPON_TYPE.SWORD,
				hole_count: 4,
				prop: {
								gj: 500,
								int: 60,
								add_sh_per: 6,
								bj_per: 4,
								desc: "攻击时有几率无视对方防御",
				},
});

this.do_attack = function (me, target, par) {
				if (target.hp > 0 && Math.random() < 0.05) {
								var dmg = Math.floor(me.query("gj") * 1.5);
								if (dmg > 0) {
												target.from_attack(dmg, 999999, null,
																"<HIY>$N手中的倚天剑锋芒一闪，剑气凌厉无匹，$n的防御顿时形同虚设！</HIY>");
								}
				}
				return 0;
};
