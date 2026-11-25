	this.inherits(SKILL);
	this.name = "神霄九灭";
	this.id = "shenxiaojiumie";
	this.grade = 4;
	this.family = FAMILIES.SUNV;
	this.desc = "霸王残魂所传的无上杖法，引九天神霄之雷灌注杖中，一击九灭，霸道绝伦。杖出如雷霆万钧，对麻痹之敌更有奇效";
	this.can_enables = ["staff"];
	this.learn_condition = { max_mp: 3500, skill: { staff: 400 } };

	this.query_enable_prop = function (lv) {
		return {
			staff: {
				gj: lv * 3 + 100,
				gj_per: parseInt(lv / 50),
				str: parseInt(lv * 0.5),
			}
		};
	}

	// 杖法位攻击结束：对麻痹之敌追加30%伤害；阳雷荡邪秽期间每次造成伤害附加当前内力3%的额外伤害。
	// （阳雷原写在 on_force_over 里，而本技能只能装在杖法位，内功钩子永远不会被调用）
	this.on_attack_over = function (me, target, par, sh) {
		if (!(sh > 0) || !target || target.hp <= 0) return;
		if (target.query_status("zidian_mabi")) {
			var bonus = Math.floor(sh * 0.3);
			target.damage(bonus, me);
		}
	};

	this.pfm = {
		wulei: {
			name: "天打五雷轰",
			distime: 30000,
			enable_skill: "staff",
			release_time: 2500,
			mp: 6,
			use: function (me, target, lv) {
				me.send_room("<HIR>$N高举神杖，九天神霄之雷应声而下——「天打五雷轰」！</HIR>");

				// 群攻：对所有敌人降下五雷
				// 群攻：每个敌人五雷，命中才回复等同于造成伤害的内力（add_mp 不会超过上限）
				me.do_attacks({
					target: target,
					times: 5,
					gj: me.gj * 1.5,
					attack_msg: function (t, n) { return "<HIY>第" + (n + 1) + "雷！</HIY>"; },
					on_target: function (t) { me.send_room("<HIY>神雷轰向$n！</HIY>", t); },
					on_hit: function (t, sh) { me.add_mp(Math.floor(sh)); }
				});
				me.send_room("<HIR>$N的天打五雷轰——五雷轰顶，群敌辟易！</HIR>");
			},
			query_desc: function (me, lv) {
				return "群攻技能，对每个敌人连续出杖五次，每击造成150%攻击力的伤害，每次命中回复等同于造成伤害的内力。";
			}
		},
		yanglei: {
			name: "阳雷荡邪秽",
			distime: 40000,
			enable_skill: "staff",
			release_time: 2000,
			mp: 5,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N挥舞神杖，引动阳雷之力——「阳雷荡邪秽」！</HIG>");
				var mpBonus = Math.floor(me.mp * 0.03);
				me.add_status({
					id: "shenxiao_yanglei",
					name: "阳雷",
					desc: "每次造成伤害附加内力3%(" + mpBonus + ")额外伤害",
					duration: 5000 + parseInt(lv * 10),
					downside: false,
					override: 2,
					prop: {},
					start_msg: "<HIG>$N周身阳雷缠绕，杖上电光闪烁！</HIG>",
					finish_msg: "$N的阳雷之力渐渐消散。",
					// 每次造成伤害附加当前内力一定比例的额外伤害：写在状态上（原在神霄九灭的 on_attack_over），融入自创武学后照常生效
					on_attack_over: function (owner, t, par, sh) {
						if (!(sh > 0) || !t || t.hp <= 0) return;
						var ylBonus = Math.floor(owner.mp * (0.03));
						if (ylBonus > 0) {
							t.damage(ylBonus, owner);
							owner.send_combat("<HIG>阳雷迸发，额外造成" + ylBonus + "点伤害！</HIG>\n", t);
						}
					},
				});
			},
			query_desc: function (me, lv) {
				var qMp = Math.floor(me.mp * 0.03);
				return "引阳雷之力加持自身，" + (5 + parseInt(lv * 10 / 1000)) + "秒内每次造成伤害时附加当前内力3%(" + qMp + ")的额外伤害。";
			}
		}
	};
