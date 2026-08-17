this.inherits(SKILL);
this.name = "三阴蜈蚣爪";
this.id = "sanyinwugongzhao";
this.grade = 3;
this.attack_actions = [
		"$N三阴蜈蚣爪带着一股阴毒之气，五指如钩抓向$n的$l",
		"$N手指弯曲如钩，指甲泛着诡异的绿光，直取$n要害",
		"$N阴笑一声，一招「蜈蚣百足」施出，双爪幻出数十道爪影笼罩$n",
		"$N身形疾欺而近，三阴蜈蚣爪「阴风搜魂」狠辣出手，直掏$n心窝",
		"$N爪风呼啸，一式「三阴索命」带着腐尸般的腥风，抓向$n的$l",
		"$N运足毒功，三阴蜈蚣爪「万毒钻心」施展开来，$n只觉腥臭扑鼻",
		"$N双手齐出，一招「毒蜈出洞」如蜈蚣百足蠕动，以诡异角度袭向$n",
		"$N厉啸一声，三阴蜈蚣爪杀招「百毒噬魂」全力击出，爪影铺天盖地罩向$n"
	];
this.parry_actions = [
		"$n爪影翻飞，三阴蜈蚣爪以毒攻毒，将$N的攻击格挡在三尺之外",
		"$n沉臂运气，一招「蜈蚣盘身」守势展开，双爪如蜈蚣卷曲护住周身要害",
		"$n不退反进，三阴蜈蚣爪「阴风护体」施出，腥风过处$N的攻势被逼退",
		"$n爪随身走，一式「毒甲护身」硬接$N的攻击，阴毒爪力将来势消解于无形",
		"$n冷笑一声，三阴蜈蚣爪守招「百毒不侵」运转，$N的攻击力道被毒劲反噬"
	];
this.desc = "星宿派毒功爪法，阴狠毒辣";
this.can_enables = ["unarmed", "parry"];
this.learn_condition = {
		max_mp: 3000,
		skill: { unarmed: 300 }
	};

this.query_enable_prop = function (lv) {
		return {
			unarmed: {
				gj: parseInt(lv * 1.6) + 20,
				mz: parseInt(lv * 1.5) + 20,
				dex: parseInt(lv * 143.0 / 1000),
			},
			parry: {
				zj: parseInt(lv * 1.5) + 20,
				fy: lv * 1 + 20,
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "三阴毒爪",
			distime: 18000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N阴笑一声，五指如钩——「三阴毒爪」！$N爪上淬着碧绿的毒芒，接连三爪抓向$n，爪风过处空气都似被毒化！</HIG>", target);
				for (var i = 0; i < 3; i++) {
					me.do_attack({
						target: target,
						gj: Math.floor(me.gj * (100 + i * 7) / 100),
						mz: me.mz,
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "快速攻击敌人三爪，每爪附加你7%的毒质内力。";
			}
		},
		pfm2: {
			name: "追魂爪",
			distime: 18000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("$N施展了三阴蜈蚣爪的追魂爪。", target);
				me.do_attack({target: target});
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "对敌人造成200%的伤害，敌人气血每减低1%，伤害增加2%";
			}
		}
	};
