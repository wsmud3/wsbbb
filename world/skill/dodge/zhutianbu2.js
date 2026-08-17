	this.inherits(SKILL);
	this.name = "诸天化身步";
	this.id = "zhutianbu2";
	this.source_skill = "zhutianbu";
	this.grade = 3;
	this.family = FAMILIES.EMEI;
	this.desc = "峨眉派轻功身法，如有千万化身。";
	this.dodge_actions = [
					"只见$n一招「天地钩」，身体腾空，双足向上，笔直地纵起丈余，躲过了$N这一招。",
					"$n身随意转，一式「凤点头」头部前挺，侧身收腹，倏地往一旁挪开了三尺，避过了这一招。",
					"$n双足抓地，身形微晃，一招「鹰爪松」有惊无险地避开了$N这一招。\n",
					"但是$n身形飘忽，一式「风摆柳」，轻轻一纵，早已避开。",
					"$n一个「阴阳箭」，向后纵出数丈之远，避开了$N的凌厉攻势，立即又欺近$N身旁。",
					"$n使出「日月扣」，双手如钩向一旁飘然纵出，轻轻着地。",
					"$n施展「诸天化身」，身形一晃，刹那间场中竟似多出数道人影，$N眼花缭乱，招式尽数落空。",
					"$n一式「万象归一」，身体如陀螺般急旋，$N的攻势被这旋转之力尽数卸去，$n已飘然落于一丈之外。"
		];
	this.can_enables = ["dodge"];
	this.learn_condition = {
					max_mp: 3000,
					skill: { dodge: 300 }
		};
	this.query_enable_prop = function (lv) {
					return {
				dodge: {
					ds: parseInt(lv * 1.5) + 0,
					con: parseInt(lv * 200.0 / 1000),
					dex: parseInt(lv * 200.0 / 1000),
				},
			}
		};
