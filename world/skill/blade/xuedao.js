	this.inherits(SKILL);
	this.name = "血刀";
	this.id = "xuedao";
	this.grade = 5;
		this.attack_actions = [
		"$N血刀一挥，刀光中带着一股血腥之气，劈向$n",
		"$N狞笑一声，手中血刀化作一道赤芒，砍向$n的$l",
		"$N刀法诡异狠辣，血刀带着刺鼻的腥风，直取$n"
	];
	this.desc = "血刀门邪功刀法，以血祭刀，凶残无比";
	this.can_enables = ["blade"];
	this.learn_condition = {
		skill: { blade: 500 }
	};

	this.on_beginfight = function (me, target) {
		me.set_temp("xuedao_start_hp", me.hp);
	};

	this.on_before_attack = function (me, target, par) {
		if (!target || target.hp <= 0) return;
		var start_hp = me.query_temp("xuedao_start_hp");
		if (!start_hp || start_hp <= me.hp) return;
		var missing = Math.floor((1 - me.hp / start_hp) * 100);
		if (missing > 0) {
			if (!par.gj) par.gj = me.gj;
			if (!par.mz) par.mz = me.mz;
			var sk = me.skills[this.id];
			var lv = sk ? sk.level : 0;
			var scale = 1 + Math.sqrt(Math.min(lv, 2000) / 2000);
			par.gj = parseInt(par.gj * (100 + missing * scale) / 100);
			par.mz = parseInt(par.mz * (100 + missing * scale) / 100);
			par.xuedao_missing = missing;
		}
	};

	this.on_attack_over = function (me, target, par, sh) {
		if (par.xuedao_missing) {
			var sk = me.skills[this.id];
			var lv = sk ? sk.level : 0;
			var scale = 1 + Math.sqrt(Math.min(lv, 2000) / 2000);
			var mult = 100 + par.xuedao_missing * scale;
			par.gj = parseInt(par.gj * 100 / mult);
			par.mz = parseInt(par.mz * 100 / mult);
		}
		// 嗜血: drain 1% of current HP per attack
		if (me.query_status("xuedao_shixue") && sh > 0) {
			var drain = Math.max(1, Math.floor(me.hp * 0.01));
			me.damage(drain, me);
		}
	};

	this.query_enable_prop = function (lv) {
		return {
			blade: {
				gj: parseInt(lv * 2200 / 1000),
				mz: parseInt(lv * 2200 / 1000),
				add_sh_per: 4,
				desc: "血祭：进入战斗后，你的气血每减少1%，造成的伤害和命中提高1%~2%（随等级成长，非线性的，2000级满）",
			},
		}
	}

	this.pfm = {
		pfm1: {
			name: "嗜血",
			distime: 60000,
			enable_skill: "blade",
			mp: 35,
			use: function (me, target, lv) {
				var time = 15000;
				var bonus = 40 + parseInt(lv / 100);
				me.send_room("<HIR>$N施展了血刀的「嗜血」，双目赤红，周身血气翻腾！</HIR>", target);
				me.add_status({
					id: "xuedao_shixue",
					name: "嗜血",
					desc: "攻击速度、命中、攻击力+" + bonus + "%，每次攻击消耗1%当前气血",
					duration: time,
					prop: {
						gjsd_per: bonus,
						mz_per: bonus,
						gj_per: bonus,
					},
					start_msg: "<HIR>$N双目赤红，施展了「嗜血」大法，攻势变得凌厉无比！</HIR>",
					finish_msg: "$N的「嗜血」效果消失了。",
				});
				me.do_attack({target: target});
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "消耗你的生命，在15秒内提升你的攻击速度，命中，攻击力" + (40 + parseInt(lv / 100)) + "%，每次攻击减少自己1%的当前气血";
			}
		},
		pfm2: {
			name: "血海魔刀",
			distime: 20000,
			enable_skill: "blade",
			mp: 35,
			use: function (me, target, lv) {
				me.send_room("<HIR>$N施展了血刀的「血海魔刀」，刀光化作漫天血影，向$n席卷而去！</HIR>", target);
				var total_damage = 0;
				var count = 5;
				for (var i = 0; i < count; i++) {
					var sh = me.do_attack({
						target: target,
						attack_msg: "<HIR>第" + (i + 1) + "道血影刀光向$n劈去！</HIR>"
					});
					if (sh > 0) total_damage += sh;
				}
				me.end_attack(target);
				if (total_damage > 0) {
					var heal = Math.floor(total_damage * 0.5);
					if (heal > 0) {
						me.do_recover(heal);
						me.send_room("<HIR>$N吸收了$n的鲜血，恢复了" + heal + "点气血！</HIR>", target);
					}
				}
			},
			query_desc: function (me, lv) {
				return "对敌人瞬间攻击5次，攻击结束后吸收你造成的总伤害的50%恢复你的气血";
			}
		}
	};
