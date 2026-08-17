	this.inherits(SKILL);
	this.name = "泰山剑法";
	this.id = "taishanjianfa";
	this.grade = 3;

	this.attack_actions = [
		"$N手中$w一晃，向右滑出三步，一招<HIB>「朗月无云」</HIB>，转过身来，身子微矮，$w向$n斜斜刺去",
		"$N手中$w圈转，一招<HIC>「峻岭横空」</HIC>去势奇疾，无数剑光刺向$n的$l",
		"$N突然腰一弯，挺$w向$n刺去，这一剑力劲剑疾，正是一招<HIC>「来鹤清泉」</HIC>",
		"$N手中$w刷的一声，反手砍向$n，剑势圆润如意：<HIY>「石关回马」</HIY>！",
		"$N展开剑势，身随剑走，左边一拐，右边一弯，越转越急。猛地$w剑光暴长，一招<HIM>「泰山十八盘」</HIM>往$n$l刺去",
		"$N手臂暴长，手中$w豁豁展开，刷刷两剑，指向$n，正是<GRN>「快活三里」</GRN>",
		"$N剑势一沉，$w自下而上猛然撩起，一道凌厉剑光拔地而起——<HIW>「岱宗如何」</HIW>！剑势如泰山日出，光芒万丈",
		"$N纵身跃起，$w凌空舞动，剑光如泰山云海翻涌——<HIC>「云海玉盘」</HIC>！层层剑影将$n笼罩在云雾之中",
		"$N踏前一步，$w化作一道惊天长虹——<HIR>「天门倒泻」</HIR>！剑气如银河倒挂南天门，朝$n轰然倾泻而下"

		];
	this.parry_actions = [
		"$n竖剑而立，$w稳如泰山，$N的攻势撞在剑上，只觉一股沉雄之力反震而回",
		"$n剑势展开，$w如泰山十八盘般层层叠叠地在身前布下剑阵，$N的$w寸步难进",
		"$n施展<HIW>「岱宗如何」</HIW>的守势，$w画出一轮旭日般的剑圈，将$N的攻势尽数吸纳",
		"$n剑法大开大阖，$w如泰山石敢当般屹立不倒，$N的凌厉杀招被一一挡了回去",
		"$n脚步沉稳，$w缓缓转动画出泰山云海之势，$N的攻势没入其中便如石沉大海"
		];
	this.desc = "泰山派的剑法";
	//<$1>$2</$1>
	//<$1>$2</$1>
	this.can_enables = ["sword", "parry"];
	this.learn_condition = {
		max_mp: 3000,
		skill: { sword: 300 }
		};

	this.query_enable_prop = function (lv) {
		return {
				sword: {
					gj: parseInt(lv * 1.5) + 10,
					mz: parseInt(lv * 1.3) + 10,
					fy: parseInt(lv * 1.5) + 10,
				},
				parry: {
					zj: parseInt(lv * 1.3) + 10,
					fy: parseInt(lv * 1.3) + 10,
					con: parseInt(lv * 100.0 / 1000),
				},
			}
		}

	this.pfm = {
		pfm1: {
				name: "七星落长空",
				distime: 22000,
				enable_skill: "sword",
				release_time: 3096,
				mp: 25,
				use: function (me, target, lv) {
					me.send_room("<HIY>$N剑指苍穹——「七星落长空」！$w依北斗七星方位连环刺出，七剑如七道流星划破长空，剑剑直指$n周身要穴！</HIY>", target);
					for (var i = 0; i < 7; i++) {
						if (me.do_attack({
							target: target,
							gj: Math.floor(me.gj * 70 / 100),
							mz: me.mz,
						})) {
							target.add_status({
								id: "qixing_ds",
								name: "七星",
								desc: "被七星落长空所伤，躲闪和防御降低",
								duration: 5000 + parseInt(lv * 5),
								override: 1,
								downside: true,
								prop: { ds_per: -parseInt(lv * 5 / 1000), fy: -5 },
							});
						}
					}
					me.end_attack(target)
				},
				query_desc: function (me, lv) {
					return "瞬间七剑攻击敌方要穴，每剑造成70%伤害，每命中一剑减少敌人" + (parseInt(lv * 5 / 1000)) + "%的躲闪和5点防御。";
				}
			}
		};
