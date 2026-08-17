this.inherits(SKILL);
this.name = "化功大法";
this.id = "huagongdafa";
this.grade = 4;
this.force_rad = 0.75;
this.desc = "星宿派丁春秋所创邪功，可化去对手内力";
this.can_enables = ["force"];
this.learn_condition = {
		max_mp: 4000,
		skill: { force: 400 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				fy: parseInt(lv * 1.5) + 10,
				gj: parseInt(lv * 1.5) + 10,
				limit_mp: lv * 155,
				desc: "唯一：将你内力的75%转化为气血",
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "化毒",
			distime: 30000,
			enable_skill: "force",
			mp: 0,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N双眼绿芒一闪，化功大法毒劲催动——「化毒」！碧绿色毒雾如活物般从$N体内汹涌而出，在$N周身翻涌缭绕。</HIG>", me);
				me.add_status({
					id: "huadu",
					name: "化毒",
					desc: "攻击和防御增加1500点，被击中后腐蚀敌方内力",
					duration: parseInt(lv * 10),
					prop: { gj: 1500, fy: 1500 },
				})},
			query_desc: function (me, lv) {
				return "化毒——在" + (parseInt(lv * 10 / 1000)) + "秒内内力化毒布满自身，增加自身1500攻击和防御，被敌人击中后毒劲反噬，将腐蚀敌方8000点内力。";
			}
		},
		pfm2: {
			name: "化功",
			distime: 20000,
			enable_skill: "force",
			mp: 0,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N运转化功大法——「化功」！一股无形的毒劲弥漫四周，附近的敌人只觉内力运转不灵，攻击和命中大幅下降！</HIG>", me);
				var env = me.environment;
				if (env) {
					var chars = env.query_all_enemy(me);
					for (var j = 0; j < chars.length; j++) {
						var c = chars[j];
						if (c !== me && me.is_fighting(c)) {
							c.add_status({
								id: "huagong",
								name: "化功",
								desc: "攻击和命中降低" + (10 + parseInt(lv / 100)) + "%",
								duration: 10000 + parseInt(lv * 5),
								downside: true,
								prop: { gj_per: -(10 + parseInt(lv / 100)), mz_per: -(10 + parseInt(lv / 100)) },
							});
						}
					}
			}},
			query_desc: function (me, lv) {
				return "化功——在" + (10 + parseInt(lv * 5 / 1000)) + "秒内力化毒布满四周，使周围的敌人攻击和命中降低" + (10 + parseInt(lv / 100)) + "%。";
			}
		}
	};
