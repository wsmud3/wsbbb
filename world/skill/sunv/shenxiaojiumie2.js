	this.inherits(SKILL);
	this.name = "神霄九灭";
	this.id = "shenxiaojiumie2";
	this.source_skill = "shenxiaojiumie";
	this.grade = 5;
	this.family = FAMILIES.SUNV;
	this.desc = "神霄九灭的至高境界，霸王残魂毕生杖法精华。九天神雷已与自身融为一体，杖出如雷神降世，所向披靡。对麻痹之敌更具毁灭性杀伤。";
	this.can_enables = ["staff"];
	this.learn_condition = { max_mp: 50000, skill: { staff: 1200, shenxiaojiumie: 1000 } };

	this.query_enable_prop = function (lv) {
		return {
			staff: {
				gj: parseInt(lv * 4200 / 1000),
				gj_per: parseInt(lv / 40),
				str: parseInt(lv * 0.7),
				mz: parseInt(lv * 2),
			}
		};
	}

	// Passive: +50% total damage to 麻痹 enemies (base 30% + 进阶 20%)
	this.on_attack_over = function (me, target, par, sh) {
		if (sh > 0 && target && target.hp > 0 && target.query_status("zidian_mabi")) {
			var bonus = Math.floor(sh * 0.5);
			target.damage(bonus, me);
		}
	};

	this.pfm = {
		wulei: {
			name: "天打五雷轰",
			distime: 25000,
			enable_skill: "staff",
			release_time: 2500,
			mp: 6,
			use: function (me, target, lv) {
				me.send_room("<HIR>$N高举神杖，九天神霄之雷应声而下——「天打五雷轰」！</HIR>");

				var enemies = me.enemy || (target ? [target] : []);
				for (var e = 0; e < enemies.length; e++) {
					var t = enemies[e];
					if (!t || t.hp <= 0 || me.hp <= 0) continue;
					me.send_room("<HIY>神雷轰向" + t.name + "！</HIY>");
					var thunderMsgs = [
							"<HIY>第一雷——「天雷破空」！神杖引雷，九天霹雳撕裂长空直劈$n！</HIY>",
							"<HIY>第二雷——「雷动九州」！雷光如龙，携万钧之势轰然砸落！</HIY>",
							"<HIY>第三雷——「电闪雷鸣」！杖影与雷光齐闪，天地为之色变！</HIY>",
							"<HIY>第四雷——「雷霆裂地」！雷劲透杖而出，大地震颤，裂石穿云！</HIY>",
							"<HIY>第五雷——「五雷轰顶」！五雷齐聚，天威煌煌，$n避无可避！</HIY>"
						];
					for (var i = 0; i < 5; i++) {
							if (t.hp <= 0 || me.hp <= 0) break;
							me.do_attack({
							target: t,
							gj: me.gj * 1.8,
							attack_msg: thunderMsgs[i]
						});
							me.mp += Math.floor(me.gj * 1.8);
					}
				}
				me.send_room("<HIR>$N的天打五雷轰——五雷轰顶，群敌辟易！</HIR>");
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "群攻技能，对每个敌人连续出杖五次，每击造成180%攻击力的伤害，每次命中回复等同于造成伤害的内力。";
			}
		},
		yanglei: {
			name: "阳雷荡邪秽",
			distime: 35000,
			enable_skill: "staff",
			release_time: 2000,
			mp: 5,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N挥舞神杖，引动阳雷之力——「阳雷荡邪秽」！</HIG>");
				var mpPct = 0.03 + Math.floor(lv / 500) * 0.01; // 每500级+1%
				var mpBonus = Math.floor(me.mp * mpPct);
				me.add_status({
					id: "shenxiao_yanglei2",
					name: "阳雷",
					desc: "每次造成伤害附加内力" + Math.floor(mpPct * 100) + "%(" + mpBonus + ")额外伤害",
					duration: 5000 + parseInt(lv * 10),
					downside: false,
					override: 2,
					prop: {},
					start_msg: "<HIG>$N周身阳雷缠绕，杖上电光闪烁！</HIG>",
					finish_msg: "$N的阳雷之力渐渐消散。",
					on_attach: function (p) {
						p.set_temp("shenxiao_yanglei2", 1);
					},
					on_expire: function (p) {
						p.remove_temp("shenxiao_yanglei2");
					},
				});
			},
			query_desc: function (me, lv) {
				var mpPct = 0.03 + Math.floor(lv / 500) * 0.01;
				var qMp = Math.floor(me.mp * mpPct);
				return "引阳雷之力加持自身，15秒内每次造成伤害时附加当前内力" + Math.floor(mpPct * 100) + "%(" + qMp + ")的额外伤害。";
			}
		}
	};

	// 阳雷荡邪秽：每次攻击命中时附加内力伤害（可成长）
	this.on_force_over = function (me, target, par, sh) {
		if (sh > 0 && target && target.hp > 0 && me.query_temp("shenxiao_yanglei2")) {
			var lv = me.query_skill("shenxiaojiumie2", 0);
			var mpPct = 0.03 + Math.floor(lv / 500) * 0.01;
			var bonus = Math.floor(me.mp * mpPct);
			if (bonus > 0) {
				target.damage(bonus, me);
				me.send_combat("<HIG>阳雷迸发，额外造成" + bonus + "点伤害！</HIG>\n", target);
			}
		}
		// 同时触发麻痹被动（如果基版已触发，这里额外+20%叠加到50%）
		if (sh > 0 && target && target.hp > 0 && target.query_status("zidian_mabi") && !me.query_temp("shenxiao_yanglei2")) {
			// 非阳雷状态下单独触发麻痹增伤20%
			var bonus2 = Math.floor(sh * 0.2);
			if (bonus2 > 0) target.damage(bonus2, me);
		}
	};
