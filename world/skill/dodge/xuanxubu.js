	this.inherits(SKILL);
	this.name = "玄虚步";
	this.id = "xuanxubu";
	this.grade = 4;
	this.is_public = true;
	this.dodge_actions = [
		"$n脚踏玄虚步，身形飘忽不定，如鬼似魅般避开了$N的攻势",
		"$n使出玄虚步，一足踏虚一足踏空，身影一晃已在数丈之外",
		"$n施展玄虚步，身形如烟如雾，$N只觉眼前一花已失去$n的踪影",
		"$n步踏玄虚，身形忽东忽西，令$N的攻击尽数落空",
		"$n运起玄虚步，身形飘渺虚幻，仿佛随时会消失在空气中",
		"$n以玄虚步法游走，步步踏在虚实之间，$N难以捕捉$n的方位",
		"$n脚下玄虚变幻，一步踏出，似左实右，$N的招式尽数打在空处",
		"$n施展玄虚步的最高境界，身形化作一道残影，从$N的攻势缝隙中穿过"
	];
	this.desc = "源自道家的无上轻功，脚踏玄虚，身形飘渺，练至极处可踏空而行";
	this.can_enables = ["dodge"];
	this.learn_condition = {
		max_mp: 4000,
		skill: { dodge: 400 }
	};

	this.query_enable_prop = function (lv) {
		return {
			dodge: {
				ds: lv * 2 + 100,
				dex: parseInt(lv * 251.0 / 1000),
				ds_per: 4,
			},
		}
	}

	// 闪避时进行反击的被动
	this.on_dodge = function (me, attacker, par) {
		if (!attacker || attacker.hp <= 0) return;
		var lv = me.query_skill("xuanxubu", 0);
		var gj = lv * 3 + 500;
		me.send_room("<hiz>$N脚踏玄虚，身形一晃，趁势反击而出！</hiz>", attacker);
		me.do_attack({
			target: attacker,
			gj: gj,
			no_weapon: true,
			no_dodge: true,
			no_parry: true,
			no_append_target: true,
			attack_msg: "<hiz>$N身形如鬼似魅，趁闪避之势，一掌反击向$n！</hiz>",
			damage_msg: "$N的玄虚反击掌力结结实实地打在$n身上！"
		});
		me.end_attack(attacker);
	};

	this.pfm = {
		pfm1: {
			name: "幻影",
			distime: 30000,
			enable_skill: "dodge",
			mp: 30,
			use: function (me, target, lv) {
				var duration = 8000;
				me.add_status({
					id: "xuanxu_hy",
					name: "玄虚·幻影",
					override: 2,
					start_msg: "<hiz>只见$N脚踏玄虚，身形化作道道幻影，飘渺不定，若有若无！</hiz>",
					finish_msg: "<hiz>$N周身的幻影渐渐消散，身形重新凝实。</hiz>",
					desc: "身形飘渺虚幻，提高" + (5 + parseInt(lv / 100)) + "%躲闪，减少" + (5 + parseInt(lv / 100)) + "%受到的伤害",
					duration: duration,
					prop: {
						ds_per: 5 + parseInt(lv / 100),
						diff_sh_per: 5 + parseInt(lv / 100),
					}
				});
			},
			query_desc: function (me, lv) {
				return "8秒内提高你" + (5 + parseInt(lv / 100)) + "%的躲闪，使用幻影迷惑敌人减少你受到的伤害" + (5 + parseInt(lv / 100)) + "%。";
			}
		}
	};
