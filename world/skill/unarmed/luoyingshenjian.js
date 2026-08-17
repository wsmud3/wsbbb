this.inherits(SKILL);
this.name = "落英神剑";
this.id = "luoyingshenjian";
this.grade = 3;
this.attack_actions = [
		"$N落英神剑掌施展开来，掌影如落花般缤纷洒落，飘向$n周身",
		"$N掌法飘逸，如秋风扫落叶，连绵不绝地攻向$n的$l",
		"$N五指虚捏如剑，一招「落英缤纷」使出，掌影化作漫天飞花笼罩$n",
		"$N身法灵动，落英神剑掌「桃花影落」施开，一掌快似一掌扫向$n",
		"$N手腕轻转，一式「神剑飞虹」以掌代剑，掌风如利刃般切向$n的$l",
		"$N身形飘忽若仙，落英神剑掌「碧海潮生」展开，$n只觉周身皆是掌影",
		"$N踏奇门方位，一招「旋风扫叶腿」以掌为剑横扫$n下盘，掌力凌冽如锋",
		"$N凝神聚气，落英神剑掌精要「桃花剑气」尽数施为，掌影剑意合而为一袭向$n"
	];
this.parry_actions = [
		"$n双掌轻拂如拈花，落英神剑掌守势「落花护体」施出，$N的攻击被缤纷掌影挡下",
		"$n身形一转，一式「飞花逐月」飘然卸力，$N的凌厉攻势尽数落空",
		"$n掌走轻灵，落英神剑掌「花间一壶酒」守招展开，将$N的攻击一一拨开",
		"$n不慌不忙，一招「落英回风」以掌为剑圈转而出，$N的劲道被引向身侧",
		"$n衣袂飘飘，落英神剑掌「春风拂槛」守势从容不迫，$N的猛攻如石沉大海"
	];
this.desc = "桃花岛黄药师所创，以掌代剑，落英缤纷";
this.can_enables = ["sword"];
this.learn_condition = {
		max_mp: 3000,
		skill: { sword: 300 }
	};

this.query_enable_prop = function (lv) {
		return {
			sword: {
				gj: parseInt(lv * 1.4) + 10,
				mz: parseInt(lv * 1.4) + 20,
				dex: parseInt(lv * 127.0 / 1000),
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "落英缤纷",
			distime: 10000,
			enable_skill: "sword",
			release_time: 3096,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIM>$N掌影如落花缤纷——「落英缤纷」！瞬间连出五掌，掌影化作漫天飞花笼罩$n！</HIM>", target);
				for (var i = 0; i < 5; i++) {
					me.do_attack({target: target});
				}
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "快速攻击敌人5次";
			}
		}
	};
