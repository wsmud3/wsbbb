	this.inherits(SKILL);
	this.name = "梯云纵";
	this.id = "tiyunzong2";
	this.source_skill = "tiyunzong";
	this.grade = 4;
	this.family = FAMILIES.WUDANG;
	this.dodge_actions = [
					"只见$n一招「<WHT>白鹤冲天</wht>」，身体向上笔直地纵起丈余，躲过了$N这一招。",
					"$n一个「<RED>鹞子翻身</RED>」，向后纵出数丈之远，避开了$N的凌厉攻势。",
					"$n使出「<MAG>大鹏展翅</MAG>」，向一旁飘然纵出，轻轻着地。",
					"但是$n一招「<WHT>白鹤冲天</wht>」身形飘忽，轻轻一纵，早已避开。",
					"$n身随意转，一招「<RED>鹞子翻身</RED>」倏地往一旁挪开了三尺，避过了这一招。",
					"可是$n一招「<MAG>大鹏展翅</MAG>」侧身一让，$N这一招扑了个空。",
					"却见$n足不点地一招「<MAG>大鹏展翅</MAG>」，往旁窜开数尺，躲了开去。",
					"$n身形微晃，一招「<RED>鹞子翻身</RED>」有惊无险地避开了$N这一招。",
					"$n施展「<CYN>云龙三折</CYN>」，身形凌空三折，宛如游龙穿云，$N的攻击尽数落空。",
					"但见$n一式「<HIW>凌虚步云</HIW>」，步步踏在虚空之上，节节高升，$N追之不及。",
					"$n使出「<HIG>仙鹤梳翎</HIG>」，身如仙鹤回旋，双袖轻拂间已将$N的攻势化解于无形。",
					"只见$n一招「<HIY>盘龙绕柱</HIY>」，身形如龙绕柱般盘旋而上，$N的招式堪堪擦过衣角。",
					"$n施展「<HIM>燕子穿云</HIM>」，身形如燕般轻灵矫捷，穿云而出，$N的攻击远远落在身后。",
					"$n一式「<GRN>扶摇直上</GRN>」，如鹏鸟乘风扶摇而上，瞬间已在九天之上，$N只击中残影。",
		];
	this.can_enables = ["dodge"];
	this.learn_condition = {
					max_mp: 4000,
					skill: { dodge: 400 }
		};
	this.query_enable_prop = function (lv) {
					return {
				dodge: {
					ds: lv * 2 + 5,
					dex: parseInt(lv * 250.0 / 1000),
					fy_per: 8,
				},
			}
		};
