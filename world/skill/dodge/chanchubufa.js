this.inherits(SKILL);
this.name = "蟾蜍步法";
this.id = "chanchubufa";
this.grade = 2;

this.dodge_actions = [
					"只见$n一招「<RED>蟾飞九天</RED>」，身体向上笔直地纵起丈余，躲过了$N这一招。",
					"但是$n一个使出「<WHT>蛙鸣震天</WHT>」，身形飘忽，轻轻一纵，早已避开。",
					"$n一招「<CYN>蛙入稻田</CYN>」，身行随意转，倏地往一旁挪开了三尺，避过了这一招。",
					"可是$n一个「<YEL>蟾蜍扑虫</YEL>」，侧身一让，$N这一招扑了个空。",
					"却见$n「<RED>蟾翻白肚</RED>」，足不点地，往旁窜开数尺，躲了开去。",
					"$n身形一招「<GRN>金蟾归月</GRN>」，身形微晃，有惊无险地避开了$N这一招。",
					"$n身形一矮，一招「<HIC>蟾蜍蹬腿</HIC>」，双腿猛地一蹬，向后弹射而出，$N的攻势尽数落空。",
					"$n忽地施展「<HIY>蛤蟆翻身</HIY>」，身形凌空翻转，以一个诡异的角度避过了$N这一招。",
					"$n一式「<HIG>月下蟾影</HIG>」，身形贴地疾掠，宛如蟾蜍踏水而行，$N的招式堪堪擦过。",
					"只见$n使出一招「<HIW>金蟾戏水</HIW>」，左纵右跳，身形忽高忽低，$N竟无法捉摸其方位。",
];
this.desc = "白驼山的轻功步法。";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["dodge"];
this.learn_condition = {
					max_mp: 2000,
					skill: { dodge: 200 }
	};

this.query_enable_prop = function (lv) {
					return {
				dodge: {
					ds: parseInt(lv * 1.5) + 0,
					str: parseInt(lv * 110.0 / 1000),
				},
			}
		};
