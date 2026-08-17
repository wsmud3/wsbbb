	this.inherits(SKILL);
	this.name = "金蛇游身掌";
	this.id = "jinsheyoushenzhang";
	this.grade = 3;
	this.is_public = true;
	this.attack_actions = [
		"$N双掌翻飞，掌势如金蛇游走，飘忽不定地拍向$n的$l",
		"$N身形一转，金蛇游身掌施展开来，一掌从诡异角度击向$n",
		"$N步法灵动，掌随身走，$w化作漫天掌影笼罩$n周身",
		"$N腰身如蛇般一扭，右掌如金蛇吐信疾刺$n的$l"
	];
	this.parry_actions = [
		"$n双掌翻飞如金蛇吐信，以金蛇游身掌的诡异掌势将$N的攻势化解",
		"$n身形如蛇般柔软，施展金蛇游身掌，$N的攻击被$n的掌力荡开",
		"$n掌法忽快忽慢，以金蛇游身掌缠丝之劲将$N的$w格在半空"
	];
	this.dodge_actions = [
		"$n身形如金蛇游走，倏忽之间已闪至一旁。",
		"$n施展金蛇游身掌，身形诡异，飘忽不定。",
		"$n腰身如蛇般一扭，整个人贴着$N的攻势滑开，仿佛没有骨头一般。",
		"$n双掌翻飞如金蛇吐信，身随掌走，刹那间已绕至$N身侧，避开了凌厉一击。",
		"$n脚下步法诡异莫测，时而如蛇行草丛、时而如蟒翻江海，$N的招式尽数落空。",
		"$n使出一式「金蛇缠丝」，身体柔若无骨地贴地旋转，$N的攻击堪堪擦过$n的发梢。",
		"$n身形忽地一矮，如金蛇入洞般贴着地面向前滑出丈余，$N的猛招尽数打在空处。",
		"$n步法忽快忽慢、忽左忽右，宛如金蛇在草丛中蜿蜒穿梭，$N眼前一花，早已失去$n的踪影。"
	];
	this.desc = "金蛇郎君所创的一门掌法，形如金蛇游走，令人难以捉摸";
	this.can_enables = ["unarmed"];
	this.learn_condition = {
		max_mp: 3000,
		skill: { unarmed: 300 }
	};

	this.query_enable_prop = function (lv) {
		return {
			unarmed: {
				gj: Math.floor(1.32 * lv),
				mz: Math.floor(1.32 * lv),
			},
		}
	}

	this.pfm = {
		pfm1: {
			name: "金龙升天",
			distime: 3000,
			enable_skill: "unarmed",
			release_time: 0,
			mp: 25,
			use: function (me, target, lv) {
				var gj = Math.floor(me.gj * 110 / 100);
				if (me.do_attack({
					target: target,
					gj: gj,
					mz: me.mz,
					attack_msg: "<HIY>$N长啸一声，双掌自下而上翻卷而起——「金龙升天」！刹那间掌风呼啸，一道金色龙形气劲自$N掌中升腾而起，蜿蜒盘旋直冲云霄，$n被这股凌厉无匹的掌力笼罩其中，只觉周身大穴尽在$N掌势覆盖之下！</HIY>",
				})) {
					target.add_status({
						id: "miss",
						name: "金蛇",
						desc: "你被金蛇游身掌的掌力所困，无法闪避",
						is_miss: true,
						duration: 3000 + parseInt(lv * 5),
						downside: true,
					});
				}
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "对敌人造成你攻击力110%的伤害，命中后使敌人在8秒内无法闪避";
			}
		}
	};
