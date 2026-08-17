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

	// Passive: +30% damage to 麻痹 enemies
	this.on_attack_over = function (me, target, par, sh) {
		if (sh > 0 && target && target.hp > 0 && target.query_status("zidian_mabi")) {
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
				var enemies = me.enemy || (target ? [target] : []);
				for (var e = 0; e < enemies.length; e++) {
					var t = enemies[e];
					if (!t || t.hp <= 0 || me.hp <= 0) continue;
					me.send_room("<HIY>神雷轰向" + t.name + "！</HIY>");
					for (var i = 0; i < 5; i++) {
						if (t.hp <= 0 || me.hp <= 0) break;
						me.do_attack({
							target: t,
							gj: me.gj * 1.5,
							attack_msg: "<HIY>第" + (i + 1) + "雷！</HIY>"
						});
						me.mp += Math.floor(me.gj * 1.5);
					}
				}
				me.send_room("<HIR>$N的天打五雷轰——五雷轰顶，群敌辟易！</HIR>");
				me.end_attack(target);
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
					on_attach: function (p) {
						p.set_temp("shenxiao_yanglei", 1);
					},
					on_expire: function (p) {
						p.remove_temp("shenxiao_yanglei");
					},
				});
			},
			query_desc: function (me, lv) {
				var qMp = Math.floor(me.mp * 0.03);
				return "引阳雷之力加持自身，" + (5 + parseInt(lv * 10 / 1000)) + "秒内每次造成伤害时附加当前内力3%(" + qMp + ")的额外伤害。";
			}
		}
	};

	// 阳雷荡邪秽：每次攻击命中时附加内力伤害
	this.on_force_over = function (me, target, par, sh) {
		if (sh > 0 && target && target.hp > 0 && me.query_temp("shenxiao_yanglei")) {
			var bonus = Math.floor(me.mp * 0.03);
			if (bonus > 0) {
				target.damage(bonus, me);
				me.send_combat("<HIG>阳雷迸发，额外造成" + bonus + "点伤害！</HIG>\n", target);
			}
		}
	};
