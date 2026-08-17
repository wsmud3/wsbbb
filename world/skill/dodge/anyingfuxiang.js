this.inherits(SKILL);
this.name = "暗影浮香";
this.id = "anyingfuxiang";
this.grade = 3;
this.desc = "身法如暗影浮动，暗香飘渺，令人难以捉摸";
this.can_enables = ["dodge"];
this.learn_condition = {
		max_mp: 3000,
		skill: { dodge: 300 }
	};

this.query_enable_prop = function (lv) {
		return {
			dodge: {
				ds: lv * 2 + 100,
				mz: parseInt(lv * 1.6) + 0,
			},
		}
	};

this.query_dodge_action = function() {
		return this.dodge_actions.random();
	};
this.dodge_actions = [
		"$n的身法诡异至极，$N眼前一花，$n的身影已经消失。",
		"$n身形一晃，$N只看到一道残影，攻击已然落空。",
		"$n身形如鬼魅般飘忽不定，$N的攻击尽数落空。",
		"$n足不点地，如一缕暗香随风飘散，$N的招式尽数打在空处。",
		"$n身形化作一道淡淡的黑影，贴着地面无声滑开，$N只觉眼前一花，目标已然不见。",
		"$n如暗夜中的幽影，身形忽左忽右、倏前倏后，$N的连环进招悉数落空。",
		"$n衣袂轻扬，身形若隐若现，仿佛是晨曦中的薄雾，$N的攻势透影而过，浑然无着力之处。",
		"$n犹如镜花水月，身影在$N面前层层荡开，$N方欲追击，$n的真身早已飘然远引。"
	];
