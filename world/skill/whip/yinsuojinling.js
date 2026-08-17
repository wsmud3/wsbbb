this.inherits(SKILL);
this.name = "银索金铃";
this.id = "yinsuojinling";
this.grade = 3;
this.attack_actions = [
		"$N银索抖动，金铃叮当作响，扰乱$n心神的同时一鞭抽出",
		"$N银索如灵蛇般缠向$n，金铃之声夺人心魄",
		"$N银索飞舞，金铃之声忽远忽近，$w如银蛇般卷向$n的$l",
		"$N手腕一振，银索上的金铃齐齐作响，$w在铃声中悄然袭至$n",
		"$N身形飘动，$w如银色匹练般在空中划出弧线，抽向$n的$l",
		"$N银索一抖，金铃急促作响，$w化作漫天银影笼罩$n",
		"$N轻叱一声，$w如灵蛇出洞，金铃之声夺魄追魂直取$n",
		"$N银索连环出击，金铃叮当不绝，$w在铃音掩护下封住$n退路"
	];
this.parry_actions = [
		"$n银索回旋，金铃之声化作音波屏障，$w将$N的攻击荡开",
		"$n手腕轻抖，$w如银蛇盘身，将$N的攻势尽数缠住",
		"$n银索挥舞，$w在空中织成一片银网，$N的兵刃难进分毫",
		"$n金铃急响，音波扰得$N攻势一滞，$w趁势封住来路",
		"$n身形旋转，$w如银色漩涡般将$N的攻击卷入化解"
	];
this.desc = "古墓派小龙女的独门兵器功夫，银索配金铃，音武结合";
this.can_enables = ["whip", "parry"];
this.learn_condition = {
		skill: {
		whip: 100
	}
};
this.query_enable_prop = function (lv) {
		return {
		whip: {
			gj: lv * 2 + 10,
			mz: lv * 1.5 + 10
		},
		parry: {
			zj: lv * 1 + 10,
			fy: lv * 1 + 10
		}
	};
}
