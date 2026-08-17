	this.inherits(SKILL);
	this.name = "蛇岛奇功";
	this.id = "shedaoqigong";
	this.grade = 2;
	this.can_enables = ["staff", "parry"];
	this.learn_condition = {
		max_mp: 2000,
		skill: { staff: 200 }
	};
	this.attack_actions = [
		"$N使一招「<HIC>仙鹤梳翎</HIC>」手中$w一提，插向$n的$l",
		"$N使出「<HIY>灵蛇出洞</HIY>」，身形微弓,手中$w倏的向$n的$l戳去",
		"$N身子微曲,左足反踢,乘势转身,使一招「<HIM>贵妃回眸</HIM>」，右手$w已戳向$n$l",
		"$N使一式「<HIY>飞燕回翔</HIY>」，背对着$n,右足一勾,顺势在$w上一点,$w陡然向自己咽喉疾射.接着$N身子往下一缩,$w掠过其咽喉,急奔$n急射而来",
		"$N忽的在地上一个筋斗,使一招「<HIW>小怜横陈</HIW>」,从$n胯下钻过,手中$w直击$n"
	];
	this.parry_actions = [
		"$n大吼一声，使一招「<HIR>子胥举鼎</HIR>」，反手擒拿$N极泉要穴,使$P这招落空",
		"$n双腿一缩,似欲跪拜,一招「<HIB>鲁达拨柳</HIB>」,$P的劲力登时落空",
		"$n突然一个倒翻筋斗,一招「<HIC>狄青降龙</HIC>」,双腿一分,跨在肩头,双掌直击$N，将$P的力道尽行碰了回去"
	];
	this.desc = "神龙岛绝技，论威力不在化骨绵掌之下，可做为杖法，招架使用";
	//"(\w+)"(.+?)"NOR"
	//<$1>$2</$1>
	this.query_enable_prop = function (lv) {
		return {
				staff: {
					gj: lv * 1 + 10,
					str: parseInt(lv * 167.0 / 1000),
				},
				parry: {
					zj: lv * 1 + 10,
					mz: lv * 1 + 10,
				},
			}
	}

	this.pfm = {
		pfm1: {
				name: "唱仙法",
				distime: 3096,
				enable_skill: "staff",
				release_time: 3096,
				mp: 20,
				use: function (me, target, lv) {
					me.send_room("<HIY>$N唱起仙法咒语——「唱仙法」！咒语声中$N周身灵气汇聚，各项属性得到仙法加持！</HIY>", me);
					me.add_status({
						id: "changxian",
						name: "唱仙",
						desc: "攻击、防御、命中、躲闪、招架增加101点（可叠加）",
						duration: 5000 + parseInt(lv * 10),
						override: 1,
						max_count: 10,
						prop: { gj: 101, fy: 101, mz: 101, ds: 101, zj: 101 },
					})},
				query_desc: function (me, lv) {
					return "蛇岛奇功之唱仙法" + (5 + parseInt(lv * 10 / 1000)) + "秒增加你的攻击，防御，命中，躲闪，招架101，可叠加最多10层";
				}
			},
		pfm2: {
				name: "吼仙法",
				distime: 20000,
				enable_skill: "staff",
				release_time: 3096,
				mp: 20,
				use: function (me, target, lv) {
					me.send_room("<HIY>$N仰天怒吼——「吼仙法」！$N将唱仙法积累的力量一次性释放，一股摧枯拉朽的仙力轰向$n！</HIY>", target);
					var stacks = 0;
					if (me.status) {
						for (var j = 0; j < me.status.length; j++) {
							if (me.status[j].id === "changxian") stacks = me.status[j].count || 0;
						}
					}
					if (stacks > 0) {
						me.remove_status("changxian");
						for (var k = 0; k < stacks; k++) {
							me.do_attack({
								target: target,
								gj: me.gj + 1000 * stacks,
								mz: me.mz,
								no_parry: true,
							});
						}
					} else {
						me.do_attack({
							target: target,
							gj: me.gj,
							mz: me.mz,
						});
					}
					me.end_attack(target)
				},
				query_desc: function (me, lv) {
					return "蛇岛奇功之吼仙法，将你的唱仙法积累的力量一次性释放出去，每层造成1000伤害，无法招架";
				}
			}
	};
