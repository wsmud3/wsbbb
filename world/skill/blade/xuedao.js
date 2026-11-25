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

	// 血祭（被动）：以进入战斗时的气血为准（引擎记在 me._combat_start_hp，战斗结束清零，所以增益只在本场战斗内有效），每减少 1% 气血，伤害提高 (1 + 每 1000 级 1)%，只加伤害不加命中。
	// 在技能级 on_attack 里按基础伤害返回附加值，等效乘算（之后再乘部位系数、增伤、暴击）。
	function xueji_per(lv) { return 1 + Math.floor((lv || 0) / 1000); }
	this.xueji_per = xueji_per;
	this.on_attack = function (me, target, par) {
		if (!par || par.is_throwing) return 0;
		var start_hp = me.fight_type ? me._combat_start_hp : 0;
		if (!start_hp || start_hp <= me.hp) return 0;
		var missing = Math.floor((1 - me.hp / start_hp) * 100);
		if (!(missing > 0)) return 0;
		var sk = me.skills && me.skills[this.id];
		var base = par.gj ?? me.gj;
		return base * missing * xueji_per(sk ? sk.level : 0) / 100;
	};

	this.query_enable_prop = function (lv) {
		return {
			blade: {
				gj: parseInt(lv * 2200 / 1000),
				mz: parseInt(lv * 2200 / 1000),
				add_sh_per: 4,
				desc: "血祭：进入战斗后，你的气血每减少1%，造成的伤害提高" + xueji_per(lv) + "%",
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
					// 每次攻击消耗 1% 当前气血：挂在状态上，融入自创武学后照常生效
					on_attack_over: function (owner, t, par, sh) {
						if (sh > 0) owner.damage(Math.max(1, Math.floor(owner.hp * 0.01)), owner);
					},
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
