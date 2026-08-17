	this.inherits(SKILL);
	this.name = "神剑诀";
	this.id = "shenjianjue";
	this.grade = 2;
	this.is_public = true;
	this.attack_actions = [
		"$N剑走轻灵，一式「神剑出鞘」，剑锋直指$n的$l",
		"$N手腕一翻，神剑诀「剑影重重」化作漫天剑光罩向$n",
		"$N身形一转，一式「剑归无极」，剑气纵横斩向$n",
		"$N剑尖疾点，一式「流星赶月」，$w化作数道寒芒疾刺$n的$l",
		"$N纵身一跃，神剑诀「天外飞仙」，$w挟风雷之势凌空击下",
		"$N剑势一收一放，一式「万剑归宗」，$w卷起漫天剑气涌向$n",
		"$N身法如电，神剑诀「白虹贯日」，$w化作一道惊虹直贯$n",
		"$N面色沉凝，一式「剑破苍穹」，$w迸发出凌厉无匹的剑气斩向$n"
	];
	this.parry_actions = [
		"$n剑光一闪，神剑诀「剑守乾坤」，$w在身前布下重重剑影",
		"$n身形微动，$w如灵蛇般缠向$N的兵刃，以柔克刚",
		"$n凝神聚气，神剑诀护体剑罡流转，$N的攻击尽被弹开",
		"$n剑走圆弧，$w划出一道太极剑圈，将$N的攻势引入虚空",
		"$n不退反进，$w后发先至，神剑诀以攻为守逼退$N"
	];
	this.desc = "传说中的神剑诀，剑招精妙，气势如虹";
	this.can_enables = ["sword", "parry"];
	this.learn_condition = {
		max_mp: 2000,
		skill: { sword: 200 }
	};
	this.query_enable_prop = function (lv) {
		return {
			sword: {
				gj: lv + 10,
				mz: lv + 20,
			},
			parry: {
				zj: lv + 10,
				fy: lv + 10,
			},
		};
	};
