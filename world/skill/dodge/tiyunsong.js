	this.inherits(SKILL);
	this.name = "梯云纵";
	this.id = "tiyunsong";
	this.grade = 1;
	this.desc = "武当派绝顶轻功，可腾空而起，如登云梯";
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
			"$n一式「白鹤冲天」，身体如仙鹤般冲天而起，$N的招式从脚底掠过。",
			"$n施展「云梯直上」，身形如踏无形云梯，节节攀升，$N的攻击尽数落空。",
			"但见$n「凌空拾阶」，身在半空，脚下如有实阶，步步高升，$N根本追之不及。",
			"$n使出「云中漫步」，身形在云端飘然而行，$N的招式远远落在身后。",
			"$n一招「九天揽月」，身形高高跃起，如欲揽月摘星，$N的攻击只打在空处。",
			"只见$n「梯云三叠」，身形凌空连踏三步，节节拔高，$N的攻势尽数化解。",
			"$n施展「仙鹤梳翎」，身如仙鹤般优雅转身，双袖轻拂，$N的攻击被轻易卸去。",
		];
