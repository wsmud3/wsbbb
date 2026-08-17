	this.inherits(SKILL);
	this.name = "天羽奇剑";
	this.id = "tianyuqijian";
	this.grade = 3;
	this.attack_actions = [
		"$N手中长剑一抖，天羽奇剑如天外飞仙直刺$n的$l",
		"$N剑招一变，天羽奇剑化作漫天剑影削向$n的$l",
		"$N长啸一声，天羽奇剑剑气纵横笼向$n的$l",
		"$N身如飘羽，剑势轻盈，$w如飞羽般无声无息刺向$n的$l",
		"$N手腕连颤，$w化作漫天羽影，如天山落雪笼罩$n周身",
		"$N剑走偏锋，天羽奇剑如惊鸿一瞥，$w已刺至$n的$l",
		"$N纵身而起，$w自空中洒下万千剑光，如天女散花袭向$n",
		"$N剑意高远，天羽奇剑「羽化登仙」，$w破空而至直取$n"
	];
	this.parry_actions = [
		"$n剑身轻转，如羽拂风，$w将$N的攻势轻轻卸到一旁",
		"$n身形飘逸，$w化作漫天羽影护住周身，$N难以攻破",
		"$n剑走轻盈，$w如飞羽般灵动，刹那间连挡$N数招",
		"$n飘然退步，$w随手一挥，天羽剑意将$N的攻击化解于无形",
		"$n以天羽剑诀护体，$w在身前织起一道剑网，$N的攻势尽皆落空"
	];
	this.desc = "飘渺峰灵鹫宫绝学剑法，剑势如天羽般飘逸，乃天山童姥观天外飞羽所创，剑意高远，凌厉无匹。";
	this.can_enables = ["sword", "parry"];
	this.learn_condition = {
		max_mp: 3000,
		skill: {
			sword: 300
		}
	};
	this.query_enable_prop = function (lv) {
		return {
			sword: {
				gj: parseInt(lv * 1.4) + 50,
				mz: parseInt(lv * 1.4) + 0,
				bj_per: 5
			},
			parry: {
				zj: parseInt(lv * 1.3) + 0,
				fy: parseInt(lv * 1.2) + 0,
			},
		};
	}
