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

	// 杖法位攻击结束：对麻痹之敌追加50%伤害（基础30%+进阶20%）；阳雷荡邪秽期间每次造成伤害附加当前内力3%（每500级+1%）的额外伤害。
	// （阳雷原写在 on_force_over 里，而本技能只能装在杖法位，内功钩子永远不会被调用）
	this.on_attack_over = function (me, target, par, sh) {
		if (!(sh > 0) || !target || target.hp <= 0) return;
		if (target.query_status("zidian_mabi")) {
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

				var thunderMsgs = [
							"<HIY>第一雷——「天雷破空」！神杖引雷，九天霹雳撕裂长空直劈$n！</HIY>",
							"<HIY>第二雷——「雷动九州」！雷光如龙，携万钧之势轰然砸落！</HIY>",
							"<HIY>第三雷——「电闪雷鸣」！杖影与雷光齐闪，天地为之色变！</HIY>",
							"<HIY>第四雷——「雷霆裂地」！雷劲透杖而出，大地震颤，裂石穿云！</HIY>",
							"<HIY>第五雷——「五雷轰顶」！五雷齐聚，天威煌煌，$n避无可避！</HIY>"
						];
				// 群攻：每个敌人五雷，命中才回复等同于造成伤害的内力（add_mp 不会超过上限）
				me.do_attacks({
					target: target,
					times: 5,
					gj: me.gj * 1.8,
					attack_msg: function (t, n) { return thunderMsgs[n]; },
					on_target: function (t) { me.send_room("<HIY>神雷轰向$n！</HIY>", t); },
					on_hit: function (t, sh) { me.add_mp(Math.floor(sh)); }
				});
				me.send_room("<HIR>$N的天打五雷轰——五雷轰顶，群敌辟易！</HIR>");
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
					// 每次造成伤害附加当前内力一定比例的额外伤害：写在状态上（原在神霄九灭的 on_attack_over），融入自创武学后照常生效
					on_attack_over: function (owner, t, par, sh) {
						if (!(sh > 0) || !t || t.hp <= 0) return;
						var ylBonus = Math.floor(owner.mp * (0.03 + Math.floor(lv / 500) * 0.01));
						if (ylBonus > 0) {
							t.damage(ylBonus, owner);
							owner.send_combat("<HIG>阳雷迸发，额外造成" + ylBonus + "点伤害！</HIG>\n", t);
						}
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
