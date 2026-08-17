this.inherits(SKILL);
this.name = "绝情掌";
this.id = "jueqingzhang";
this.grade = 2;
this.attack_actions = [
		"$N绝情掌法冷酷无情，掌风如刀般劈向$n的$l",
		"$N面无表情，绝情掌力破空而至，凌厉劲风令人心寒",
		"$N眼神冰冷，一招「断情绝义」毫无征兆地拍出，掌力直取$n心口要害",
		"$N双掌翻飞，绝情掌「无情无义」施展开来，掌影如冰刃般划向$n的$l",
		"$N冷哼一声，「斩情灭心」悍然出手，掌劲破空之声犹如鬼哭",
		"$N身形如鬼魅般欺近，绝情掌杀招「绝情绝命」带着刺骨寒劲印向$n",
		"$N面色如霜，一式「移花接木」虚虚实实，掌力自不可思议的角度袭向$n",
		"$N运足内力，绝情掌至高绝学「天地无情」轰然击出，$n只觉四周生机尽绝"
	];
this.parry_actions = [
		"$n面不改色，绝情掌以冷酷著称的守势施出，$N的攻击如撞冰山寸步难进",
		"$n双掌一翻，一式「冰心玉壶」展开，寒意森森的掌力将$N的攻势冻结于半途",
		"$n身形微侧，绝情掌「冷面无情」之守招使出，轻描淡写间化解$N的猛攻",
		"$n以静制动，一招「心如止水」从容格挡，$N的狂暴攻击被一一卸去",
		"$n反手轻拂，绝情掌「情丝断绝」守势运转，$N的攻击劲道被悄然化于无形"
	];
this.desc = "移花宫绝学掌法，出手无情";
this.can_enables = ["unarmed"];
this.learn_condition = {
		max_mp: 2000,
		skill: { unarmed: 200 }
	};

this.query_enable_prop = function (lv) {
		return {
			unarmed: {
				gj: parseInt(lv * 1.2) + 20,
				mz: parseInt(lv * 820.0 / 1000),
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "迷魂",
			distime: 25000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<HIM>$N掌中暗含迷魂之力——「迷魂」！一掌拍出，掌风之中带着惑人心神的诡异力量！</HIM>", target);
				if (me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz,
				})) {
					target.add_status({
						id: "busy",
						name: "忙乱",
						desc: "被迷魂掌力所惑，无法正常行动",
						is_busy: true,
						duration: Math.min(6000 + parseInt(lv * 5), 11000),
						downside: true,
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "迷惑敌人，使敌人在" + (Math.min(6000 + parseInt(lv * 5), 11000) / 1000) + "秒内处于忙乱状态";
			}
		}
	};
