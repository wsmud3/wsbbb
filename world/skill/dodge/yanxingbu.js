	this.inherits(SKILL);
	this.name = "雁行步";
	this.id = "yanxingbu";
	this.grade = 1;
	this.desc = "如雁行之轻盈，步伐灵动多变";
	this.can_enables = ["dodge"];
	this.learn_condition = {
			skill: {
			dodge: 100
		}
	};
	this.query_enable_prop = function (lv) {
			return {
			dodge: {
				ds: lv * 2,
				mz: lv * 1.5
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
			"$n一式「雁南飞」，身形如雁展翅南飞，斜斜掠出数丈，$N的攻击尽数落空。",
			"$n施展「雁落平沙」，身形轻灵如雁落沙滩，飘然着地后瞬间弹起，$N的攻击打在空处。",
			"但见$n「雁阵惊寒」，身形如雁阵般忽聚忽散，飘忽不定，$N难以锁定其方位。",
			"$n使出「孤雁出群」，身形单独掠出，快如闪电，$N只觉眼前一花，$n已在包围之外。",
			"$n一招「雁字回时」，身形如雁字般凌空回旋，优雅地绕至$N身侧，$N的攻击擦身而过。",
			"只见$n「长空雁叫」，身形伴随长啸冲天而起，$N的招式从脚下掠过。",
			"$n施展「雁渡寒潭」，身法轻灵如雁掠水面，足尖虚点，$N的攻击招招落空。",
		];
