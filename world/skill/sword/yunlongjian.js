	this.inherits(SKILL);
	this.name = "云龙剑";
	this.id = "yunlongjian";
	this.grade = 2;

	this.attack_actions = [
		"$N使一式<GRN>「悠悠顺自然」</GRN>，手中$w嗡嗡微振，幻成一条白光刺向$n的$l",
		"$N错步上前，使出<HIC>「来去若梦行」</HIC>，剑意若有若无，$w淡淡地向$n的$l挥去",
		"$N一式<HIB>「志当存高远」</HIB>，纵身飘开数尺，运发剑气，手中$w遥摇指向$n的$l",
		"$N纵身轻轻跃起，一式<HIW>「表里俱澄澈」</HIW>，剑光如水，一泻千里，洒向$n全身",
		"$N手中$w中宫直进，一式<BLU>「随风潜入夜」</BLU>，无声无息地对准$n的$l刺出一剑",
		"$N手中$w一沉，一式<HIG>「润物细无声」</HIG>，无声无息地滑向$n的$l",
		"$N手中$w斜指苍天，剑芒吞吐，一式<HIY>「云龙听梵音」</HIY>，对准$n的$l斜斜击出",
		"$N左指凌空虚点，右手$w逼出丈许雪亮剑芒，一式<RED>「万里一点红」</RED>刺向$n的咽喉",
		"$N合掌跌坐，一式<MAG>「我心化云龙」</MAG>，$w自怀中跃出，如疾电般射向$n的胸口",
		"$N呼的一声拔地而起，一式<HIY>「日月与同辉」</HIY>，$w幻出万道光影，将$n团团围住",
		"$N随风轻轻飘落，一式<GRN>「清风知我意」</GRN>，手中$w平指，缓缓拍向$n脸颊"

		];
	this.desc = "天地会看家本领，其特殊攻击法威力奇大，堪称武林一绝。学习需要云龙心法支持。";
	//"(\w+)"(.+?)"NOR"
	//<$1>$2</$1>
	this.can_enables = ["sword"];
	this.learn_condition = {
		max_mp: 2000,
		skill: { sword: 200 }
		};

	this.query_enable_prop = function (lv) {
		return {
				sword: {
					gj: parseInt(lv * 1.1) + 10,
					mz: lv * 1,
				},
			}
		}

	this.pfm = {
		pfm1: {
				name: "云龙三现",
				distime: 10000,
				enable_skill: "sword",
				release_time: 3096,
				mp: 20,
				use: function (me, target, lv) {
					me.send_room("<HIW>$N剑出如龙——「云龙三现」！$w幻出三道白色剑光，如云中神龙乍现，$n只见白光闪烁，剑已及身！</HIW>", target);
					for (var i = 0; i < 3; i++) {
						me.do_attack({
							target: target,
							gj: me.gj,
							mz: Math.floor(me.mz * (150 + i * 50) / 100),
						});
					}
					me.end_attack(target)
				},
				query_desc: function (me, lv) {
					return "快速出剑攻击敌人出其不意，配合云龙心法如龙吟般声响减少敌人躲闪几率，每次攻击增加命中50%，对敌人造成自身攻击力150%的伤害。";
				}
			}
		};
	;
	//this.on_learn = function (me) {
	//    if (me.max_mp < 100)
	//        return me.notify_fail("你的内力不够。");
	//    if (me.query_skill("sword", 1) < 60)
	//        return me.notify_fail("你的基础不够，无法领会更高深的技巧。");
	//    if (me.query_skill("yunlongxinfa", 1) < 60)
	//        return me.notify_fail("你的云龙心法等级不够，无法学习云龙剑。");
	//    return true;
	//}
