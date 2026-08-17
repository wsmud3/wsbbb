this.inherits(SKILL);
this.name = "屠神大法";
this.id = "tushendafa";
this.grade = 6;
this.force_rad = 1.5;
this.family = FAMILIES.SHASHOU;
this.desc = "杀手楼至高绝学，粗通皮毛即可匹敌传说中的药神，据说修炼至大成者可屠神灭魔。";
this.can_enables = ["force", "blade"];
this.learn_condition = {
	skill: {
		blade: 800,
		force: 800
	}
};
this.query_enable_prop = function (lv) {
	var per = 10 + parseInt(lv / 200) * 10;
	var qishaPer = 1 + Math.floor(lv / 1000);
	return {
		force: {
			bj_per: Math.floor(1+lv/200),
			gj_per: Math.floor(1+lv/200),
			mz_per: Math.floor(1+lv/200),
			gjsd_per: Math.floor(1+lv/200),
			limit_mp: lv * 1000,
			desc: "七杀：敌人气血每减少1%，你的命中与暴击伤害增加" + qishaPer + "%\n唯一：将你内力的150%转化为气血"
		},
		blade: {
			gj: Math.floor(lv*3.5),
			bj_per: Math.floor(1+lv/200),
			gj_per: Math.floor(1+lv/200),
			mz_per: Math.floor(1+lv/200)
		}
	};
};
this.on_before_attack = function (me, target, par) {
	if (!target || target === me) return;
	if (me.query_temp("tushen_before")) return;
	me.set_temp("tushen_before", 1);
	var prev = me.query_temp("tushen_addsh", 0);
	if (prev > 0) {
		me.add_prop("add_sh_per", -prev);
		me.remove_temp("tushen_addsh");
	}
	var missingHpPercent = 100 - Math.floor(target.hp * 100 / target.max_hp);
	if (missingHpPercent > 0) {
		var lv = me.query_skill("tushendafa");
		var multiplier = 1 + Math.floor(lv / 1000);
		var bonus = missingHpPercent * multiplier;
		if (bonus > 0) {
			me.add_prop("add_sh_per", bonus);
			me.set_temp("tushen_addsh", bonus);
			par.mz = parseInt((par.mz || me.mz) * (100 + bonus) / 100);
			par.add_bjsh_per = (par.add_bjsh_per || 0) + bonus;
		}
	}
};
this.on_force_over = function (me, target, par, sh) {
	me.remove_temp("tushen_before");
	var prev = me.query_temp("tushen_addsh", 0);
	if (prev > 0) {
		me.add_prop("add_sh_per", -prev);
		me.remove_temp("tushen_addsh");
	}
	if (sh > 0 && me.query_temp("tushen")) {
		var lv = me.query_skill("tushendafa");
		var healPer = 5 + Math.floor(lv / 500);
		var lostHp = me.max_hp - me.hp;
		var heal = Math.floor(lostHp * healPer / 100);
		if (heal > 0) {
			me.do_recover(heal);
			me.send_room("<hig>$N屠神之力涌动，恢复了" + heal + "点气血。</hig>");
		}
	}
};
this.on_attack_over = function (me, target, par, sh) {
	me.remove_temp("tushen_before");
	var prev = me.query_temp("tushen_addsh", 0);
	if (prev > 0) {
		me.add_prop("add_sh_per", -prev);
		me.remove_temp("tushen_addsh");
	}
};
this.pfm = {
	tushen: {
		name: "屠神",
		distime: 30000,
		enable_skill: "force",
		mp: 20,
		release_time: 500,
		use: function (me, target, lv) {
			var bj_sh = 30 + Math.floor(lv / 100) * 2;
			var diff_fy = 20 + Math.floor(lv / 100) * 2;
			var gjsd = 20 + Math.floor(lv / 100) * 2;

			var duration = 6000 + Math.floor(lv / 100) * 1000;
			me.send_room("<hig>$N仰天长啸，一股恐怖的屠神之力从体内爆发，周身笼罩在血色光芒之中！</hig>");
			me.add_status({
				id: "tushen",
				name: "屠神",
				desc: "屠神之力附体，战斗力大幅提升",
				duration: duration,
				prop: {
					add_bjsh_per: bj_sh,
					diff_fy_per: diff_fy,
					gjsd_per: gjsd,
				},
				on_attach: function (p) {
					p.set_temp("tushen", 1);
				},
				on_expire: function (p) {
					p.remove_temp("tushen");
				},
				finish_msg: "$N身上的屠神之力渐渐消散。"
			});
		},
		query_desc: function (me, lv) {
			var bj_sh = 30 + Math.floor(lv / 100) * 2;
			var diff_fy = 20 + Math.floor(lv / 100) * 2;
			var gjsd = 20 + Math.floor(lv / 100) * 2;

			var duration = (6000 + Math.floor(lv / 100) * 1000) / 1000;
			var healPer = 5 + Math.floor(lv / 500);
			return"爆发屠神之力，" + duration +"秒内" +"无视防御+" + diff_fy +"%，攻击速度+" + gjsd +"%，每次攻击回复" + healPer +"%已损失气血";
		}
	},
	qisha: {
		name: "七杀经",
		distime: 10000,
		enable_skill: "blade",
		weapon_type: WEAPON_TYPE.BLADE,
		mp: 10,
		release_time: 4000,
		use: function (me, target, lv) {
			me.send_room("<HIR>$N眼中杀意暴涨，手中刀化作七道血色刀芒，一刀快过一刀地斩向$n！</HIR>", target);
			var baseGj = me.gj;
			var gj = baseGj * 7;
			for (var i = 0; i < 7; i++) {
				if (!me.fight_type || !target || target.hp <= 0) break;
				if (me.do_attack({target: target, gj: gj})) {
					gj = gj + baseGj * 7;
				}
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return"发动七次攻击，每次造成700%伤害，命中后下次攻击伤害增加700%";
		}
	}
};
