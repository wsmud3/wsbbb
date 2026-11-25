	this.inherits(SKILL);
	this.name = "一苇渡江";
	this.id = "shaolinshenfa2";
	this.source_skill = "shaolinshenfa";
	this.grade = 4;
	this.family = FAMILIES.SHAOLIN;
	this.dodge_actions = [
	"$n一式「<HIG>一苇渡江</HIG>」，前后脚脚尖脚跟相靠，身体如行云流水般滑出丈余。",
	"$n一式「<WHT>雨燕掠波</WHT>」，双臂前伸，全身贴地平飞，顿时闪过了$N的凌厉攻势。",
	"$n一式「<CYN>移步换形</CYN>」，足不动，手不抬，一转眼间便绕到了$N的身后。",
	"$n一式「<MAG>分身化影</MAG>」，一转身间，四面八方飘动着无数个$n的身影，令$N手无足措。",
	"$n一式「<HIY>孤骛落日</HIY>」，全身笔直，拔地而起，在半空中一转，已落到几丈远的地方",
	"$n一式「<BLU>鸿雁双飞</BLU>」，两臂鹏举如翼，在剌剌风声中，从$N头顶横跃而过。",
	"$n一式「<RED>苍龙出水</RED>」，双脚点地，全身化为一道白影，急速绕着$N打了几转。",
	"$n一式「<HIR>稚凤归巢</HIR>」，身体如陀螺般急转，气流形成一个个漩涡，令$N陷身其间，动弹不得。",
	];
	this.can_enables = ["dodge"];
	this.learn_condition = {
	max_mp: 4000,
	skill: { dodge: 400 }
	};
	// 面板按 1000 级数值折算为随等级成长；百分比项 1000 级保持原值，每 300 级 +1%。
	this.query_enable_prop = function (lv) {
	return {
									dodge: {
				ds: parseInt(lv * 1810 / 1000),
				str: parseInt(lv * 254 / 1000),
				dex: parseInt(lv * 254 / 1000),
									},
		}
	};

	this.on_dodge_over = function (me, target, par) {
	var lv = me.query_skill("shaolinshenfa2", 0); // 原先引用了未定义的 lv，触发即 ReferenceError
	if (!par.is_dodge && !me.query_temp("yiwei_fy")) {
									me.add_status({
				id: "yiwei_passive", // 与绝招「一苇渡江」（id dodge）分开，避免同 id 不同 override 互相挤掉
				name: "一苇渡江",
				desc: "一苇渡江之卸力诀，增加你的防御",
				prop: {
																	fy: parseInt(lv)
				},
				duration: parseInt(lv * 10),
				override: 1,
				max_count: 10
			});
									me.set_temp("yiwei_fy", 1, 1000);
		}
	}

	this.pfm = {
	lingbo:
	{
									name: "一苇渡江",
									distime: 30000,
									enable_skill: "dodge",
									release_time: 3096,
									mp: 20,
									use: function (me, target, lv) {

													var gj = lv * 10 + 10000;

													me.add_status({
																	id: "dodge",
																	name: "一苇渡江",
																	start_msg: "<hiy>$N足尖轻点地面，施展一苇渡江，凌空跃起，身形顿时变得轻松自如。</hiy>",
																	desc: "少林身法之一苇渡江，增加你身法",
																	duration: gj,
																	prop: {
																					dex: parseInt(lv / 10 + 5)
																	}
													});
									},
									query_desc: function (me, lv) {
		var gj = lv * 10 + 10000;
		var dex = parseInt(lv / 10 + 5);
		return"少林身法之一苇渡江，" + (gj / 1000) +"秒内增加你" + dex +"身法。";
									}
		}
	};
