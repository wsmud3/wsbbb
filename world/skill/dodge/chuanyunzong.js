	this.inherits(SKILL);
	this.name = "穿云纵";
	this.id = "chuanyunzong";
	this.grade = 2;
	this.desc = "穿云纵";
	this.can_enables = ["dodge"];
	this.learn_condition = {
		max_mp: 2000,
		skill: { dodge: 200 }
	};
	this.query_enable_prop = function (lv) {
		return {
			dodge: {
				ds: parseInt(lv * 1.6) + 0,
				dex: parseInt(lv * 152.0 / 1000),
			}
		};
	}
	this.query_dodge_action = function() {
		return this.dodge_actions.random();
	};
	this.dodge_actions = [
		"$n身形飘忽，宛如轻烟，$N的攻击落空了。",
		"$n足不点地，一招「青云直上」，$N的攻击差之毫厘。",
		"$n身法如电，$N只觉眼前一花，$n已在数丈之外。",
		"$n长啸一声，施展「穿云破雾」，身形如箭般冲天而起，$N的招式尽数打在空处。",
		"$n一式「云中漫步」，步法飘渺不定，身形如在云雾之中，$N难以捉摸其踪迹。",
		"$n使出一招「凌空飞渡」，身形横移数丈，仿佛踏云而行，$N的攻击远远落在身后。",
		"但见$n「乘风而起」，衣袂飘飘，整个人被一股劲风托起，$N的招式从脚下掠过。",
		"$n身形急转，一招「九霄云外」，凌空翻身，轻飘飘地落在$N攻击范围之外。",
		"$n施展「云龙九现」，身形倏东倏西，变幻莫测，$N眼花缭乱，攻击全然落空。",
		"只见$n一式「拨云见日」，双袖轻拂，借力腾挪，轻巧地避开了$N这一招。",
	];
