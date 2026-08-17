	this.inherits(SKILL);
	this.name = "辟邪剑法";
	this.id = "pixiejianfa";
	this.grade = 5;
	this.attack_actions = [
		"$N剑法快如鬼魅，一道寒光闪过，已然刺到$n身前",
		"$N身法诡异，剑招更是快得不可思议，$n只觉眼前一花",
		"$N辟邪剑法展开，剑光如电，招招不离$n要害",
		"$N身形一晃，已如鬼影般绕至$n身后，一剑无声无息刺向$n后心",
		"$N剑尖颤动不休，幻出数十点寒星，将$n的$l尽数笼罩其中",
		"$N一声尖啸，手中$w化作一道银蛇，以不可思议的角度挑向$n的$l",
		"$N步法飘忽，剑随身走，眨眼间已刺出七八剑，每一剑都指向$n必救之处",
		"$N眼中寒光一闪，身法快逾闪电，$w如附骨之蛆般缠向$n的$l"
	];
	this.parry_actions = [
		"$n冷笑一声，$w斜斜一带，将$N那快如鬼魅的攻势尽数荡开",
		"$n身法如鬼魅般飘忽，$N只觉眼前一花，凌厉的剑招已然落空",
		"$n手腕微震，$w发出尖锐鸣响，以快打快，将$N的杀招封在门外",
		"$n不闪不避，$w后发先至，抢先刺向$N腕脉，逼得$N不得不收招回防",
		"$n剑尖一颤，划出数道残影，$N的辟邪剑招被无声无息地化解于无形"
	];
	this.desc = "林家祖传剑法，剑招诡异迅捷，出自葵花宝典残篇";
	this.can_enables = ["sword", "parry"];
	this.learn_condition = {
		max_mp: 5000,
		skill: { sword: 500 }
	};

	this.query_enable_prop = function (lv) {
		return {
			sword: {
				gj: lv * 2 + 10,
				mz: parseInt (lv * 1.5 + 20),
				dex: parseInt(lv * 127.0 / 1000),
				bj_per: 8,
			},
			parry: {
				zj: parseInt(lv * 2310 / 1000),
				diff_sh_per: 4,
				dex: parseInt(lv * 127.0 / 1000),
			},
		}
	}

	this.pfm = {
		cimu: {
			name: "刺目",
			distime: 30000,
			enable_skill: "sword",
			release_time: 3000,
			mp: 35,
			use: function (me, target, lv) {
				me.send_room("<HIR>$N眼中杀机骤现，身形化作一道残影，手中$w光芒暴涨，剑尖凝聚一点寒星——「刺目」！这一剑不取咽喉、不刺心口，偏生直夺$n双目而去，快得仿佛电光石火，令人避无可避！</HIR>", target);
				var sh = me.do_attack({target: target, gj: me.gj * 1.5});
				// 施加失明debuff
				target.add_status({
						id: "pixie_shiming",
						name: "失明",
						desc: "无法命中敌人，无法躲闪，必被暴击",
						duration: 8000 + parseInt(lv * 5),
						only_combat: true,
						downside: true,
						override: 2,
						prop: {
							mz_per: -(90 + parseInt(lv / 100)),
							ds_per: -(90 + parseInt(lv / 100)),
							diff_bj: -9999,
						},
						start_msg: "<HIR>$n双目被$N一剑刺中，眼前霎时一片漆黑，血光弥漫中什么也看不见了！</HIR>",
						finish_msg: "$n的视力恢复了。",
					}, me);
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "快速出剑攻击敌方双目，命中后使敌人在" + (8 + parseInt(lv * 5 / 1000)) + "秒内处于失明状态(无法命中敌人，无法躲闪，必被暴击)。";
			}
		}
	};
