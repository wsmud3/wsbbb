	this.inherits(SKILL);
	this.name = "身空行";
	this.id = "shenkongxing2";
	this.grade = 2;
	this.desc = "身空行";
	this.can_enables = ["dodge"];
	this.learn_condition = {
		max_mp: 2000,
		skill: { dodge: 200 }
	};
	this.query_enable_prop = function (lv) {
		return {
			dodge: {
				ds: lv * 2 + 100,
				con: parseInt(lv * 210.0 / 1000),
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
		"$n一式「身空无物」，身体仿佛化为一缕虚无，$N的招式透体而过，却未伤及分毫。",
		"$n施展「凌虚步」，双足离地三寸，飘然而行，$N的攻击堪堪擦过衣角。",
		"但见$n一招「虚空挪移」，身形原地消失，瞬间出现在数尺之外，$N的攻击落了空。",
		"$n使出一式「幻影无踪」，身形一化为三，$N眼花缭乱，不知哪个才是真身。",
		"$n施展「踏雪无痕」，身形轻如鸿毛，落地无声，$N的攻击尽数打在空处。",
		"只见$n「心空万境」，闭目凝神，身形随气而动，$N的招式竟自行偏离了方向。",
		"$n一式「无我无相」，身形如烟似雾，飘渺不定，$N只觉眼前一花，$n已到了$N身后。",
	];
