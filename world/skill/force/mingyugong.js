this.inherits(SKILL);
this.name = "明玉功";
this.id = "mingyugong";
this.grade = 4;
this.force_rad = 0.7;
this.desc = "移花宫的绝世内功心法，修至大成可内力生生不息，同时身法轻盈如明玉映光";
this.can_enables = ["force", "dodge"];
this.learn_condition = {
		max_mp: 4000,
		skill: { force: 400 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				dazuo_per: 20,
				expend_mp_per: -20,
				per: 11,
				max_hp: lv * 10,
				limit_mp: lv * 150,
				desc: "唯一：将你内力的70%转化为气血",
			},
			dodge: {
				ds: parseInt(lv * 1.5) + 0,
				dex: parseInt(lv * 176.0 / 1000),
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "明玉",
			distime: 60000,
			enable_skill: "force",
			mp: 30,
			use: function (me, target, lv) {
				me.send_room("<HIW>$N双手结印，明玉功内力如皓月之光倾泻而出——「明玉」！$N周身泛起温润如玉的白色光华，全身属性大幅提升！</HIW>", me);
				me.add_status({
					id: "mingyu",
					name: "明玉",
					desc: "攻击、防御、命中、躲闪、招架增加" + (10 + parseInt(lv / 100)) + "%",
					duration: 20000 + parseInt(lv * 10),
					prop: { gj_per: 10 + parseInt(lv / 100), fy_per: 10 + parseInt(lv / 100), mz_per: 10 + parseInt(lv / 100), ds_per: 10 + parseInt(lv / 100), zj_per: 10 + parseInt(lv / 100) },
				})},
			query_desc: function (me, lv) {
				return "明玉——增加你" + (10 + parseInt(lv / 100)) + "%的攻击、防御、命中、躲闪、招架，持续" + (20 + parseInt(lv * 10 / 1000)) + "秒。";
			}
		},
		pfm2: {
			name: "太上忘情",
			distime: 30000,
			enable_skill: "force",
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<HIW>$N神色淡然，如太上忘情——「太上忘情」！$N周身散发出清冷如月的光华，这光华化作无数道白色光刃，向$n切割而去！</HIW>", target);
				if (me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz,
					no_dodge: true,
				})) {
					target.add_status({
						id: "taishang",
						name: "太上",
						desc: "每" + (parseInt(lv * 5 / 1000)) + "秒受到1033点伤害",
						duration: parseInt(lv * 5),
						duration_count: 20,
						downside: true,
						data: { dps: 1033 },
						start_msg: "<HIW>$n被太上忘情的光华笼罩，每2秒受到切割伤害！</HIW>",
						finish_msg: "$n身上的太上忘情之力消散。",
						on_interval: function(target, count) {
							target.from_attack(1033 * count, 999999, null, "<HIW>$N太上忘情之力切割$n！</HIW>");
						},
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "太上忘情——每" + (parseInt(lv * 5 / 1000)) + "秒对敌人造成1033伤害，持续20次，无法躲闪。";
			}
		}
	};
