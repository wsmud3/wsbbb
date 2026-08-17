	this.inherits(SKILL);
	this.name = "素女心经";
	this.id = "sunvxinjing";
	this.grade = 3;
	this.family = FAMILIES.SUNV;
	this.force_rad = 0.85;
	this.desc = "素女道进阶内功心法，融汇身法与内力于一体，修习者可容颜永驻，气质出尘";
	this.can_enables = ["force", "dodge"];
	this.learn_condition = { max_mp: 2000, skill: { force: 200, dodge: 200 } };

	this.query_enable_prop = function (lv) {
		return {
			force: {
				max_hp: lv * 15,
				fy: parseInt(lv * 2),
				mz: lv + 50,
			},
			dodge: {
				ds: lv + 30,
				per: parseInt(lv / 100),
				dex: Math.round(lv / 6),
			}
		};
	}

	this.pfm = {
		faxiang: {
			name: "玄女法相",
			distime: 30000,
			enable_skill: "force",
			release_time: 2000,
			mp: 4,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N运转素女心经，玄女法相显现，周身仙气缭绕，容貌与功力骤然提升！</HIG>");
				me.add_status({
					id: "sunv_faxiang",
					name: "法相",
					desc: "容貌+" + parseInt(lv / 100) + "，攻击+" + parseInt(lv * 1.5),
					duration: 12000,
					downside: false,
					override: 2,
					prop: {
						per: parseInt(lv / 100),
						gj: parseInt(lv * 1.5),
					},
					start_msg: "<HIG>$N身后浮现玄女法相，仙姿绝世！</HIG>",
					finish_msg: "$N的玄女法相缓缓消散。",
				});
			},
			query_desc: function (me, lv) {
				return "召唤玄女法相加持自身，12秒内容貌+" + parseInt(lv / 100) + "，攻击+" + parseInt(lv * 1.5) + "。";
			}
		},
		meihun: {
			name: "魅魂",
			distime: 25000,
			enable_skill: "force",
			release_time: 1500,
			mp: 3,
			use: function (me, target, lv) {
				if (!target) return me.notify("你要用魅魂对付谁？");
				if (me.per > target.per) {
					var duration = parseInt(lv / 100) * 1000;
					if (duration < 1000) duration = 1000;
					if (duration > 11000) duration = 11000;
					me.send_room("<HIM>$N对$n施展魅魂之术，$n心神荡漾，迷失在$N的绝世容颜之中！</HIM>", target);
					target.add_status({
						id: "sunv_mihun",
						name: "迷魂",
						desc: "被魅魂所惑，无法进行普通攻击，持续" + (duration / 1000) + "秒",
						duration: duration,
						downside: true,
						is_busy: true,
						start_msg: "<HIM>$n被$N的魅魂之术所惑，心神失守！</HIM>",
						finish_msg: "$n从魅魂中清醒过来。",
					}, me);
				} else {
					me.send_room("$N对$n施展魅魂之术，但$n定力过人，不为所动。", target);
				}
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				var per = me.query_prop("per");
				return "以容貌魅惑敌人，若自身容貌（当前" + (per || 0) + "）高于对手，则令其陷入迷魂状态" + parseInt(lv / 100) + "秒（无法普攻）。";
			}
		}
	};
