this.inherits(EQUIPMENT);
this.set({
				grade: 5,
				name: "屠龙刀",
				desc: "武林至尊，宝刀屠龙。号令天下，莫敢不从。倚天不出，谁与争锋！这就是武林至尊屠龙宝刀！",
				unit: "把",
				eq_type: EQUIP_TYPE.BLADE,
				hole_count: 4,
				prop: {
								gj: 450,
								str: 65,
								con: 40,
								add_sh_per: 5,
				},
});

this.do_attack = function (me, target, par) {
				if (target && target.hp > 0 && Math.random() < 0.05) {
								me.send_combat("<HIR>屠龙刀刀气爆发，造成双倍伤害！</HIR>\n", target);
								return (par.gj ?? me.gj);
				}
				return 0;
};
