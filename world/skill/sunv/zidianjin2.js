	this.inherits(SKILL);
	this.name = "紫电七击";
	this.id = "zidianjin2";
	this.source_skill = "zidianjin";
	this.grade = 4;
	this.family = FAMILIES.SUNV;
	this.force_rad = 0.85;
	this.desc = "紫电劲的至高进阶，融霸道雷霆之力于拳掌之间，一击七杀，紫电横空。拳出如雷震，劲发似电殛，闻者丧胆";
	this.can_enables = ["unarmed", "force"];
	this.learn_condition = { max_mp: 3500, skill: { unarmed: 400, force: 400 } };

	this.query_enable_prop = function (lv) {
		return {
			unarmed: {
				gj: parseInt(lv * 2 + 50),
				mz: parseInt(lv * 1.7 + 50),
				limit_mp: lv * 150,
			},
			force: {
				limit_mp: lv * 150,
				gj_per: parseInt(5 + lv / 200),
				add_sh_per: parseInt(5 + lv / 200),
			}
		};
	}

	this.pfm = {
		jinglei: {
			name: "惊雷爆五岳",
			distime: 30000,
			enable_skill: "unarmed",
			release_time: 2000,
			mp: 0,
			use: function (me, target, lv) {
				var cost = Math.floor(me.max_mp * 0.1);
				if (me.mp < cost) return me.notify("内力不足，无法施展惊雷爆五岳。");

				me.send_room("<HIR>$N暴喝一声，紫电七击——「惊雷爆五岳」！拳出如雷，震撼五岳！</HIR>", target);

				var hits = 0;
				var totalDmg = 0;

				var thunderMsgs = [
					"<HIY>$N第一击——「雷震五岳」！拳出如岳，天崩地裂般轰向$n！</HIY>",
					"<HIY>$N第二击——「电闪九霄」！身化紫电，迅雷不及掩耳之势贯向$n！</HIY>",
					"<HIY>$N第三击——「雷霆万钧」！紫电拳劲携万钧之力当头砸下！</HIY>",
					"<HIY>$N第四击——「轰雷掣电」！拳影与电光交织，$n已分不清是拳是雷！</HIY>",
					"<HIY>$N第五击——「紫电贯日」！紫芒大盛，宛若烈日炸裂，一拳洞穿$n！</HIY>"
				];
				for (var i = 0; i < 5; i++) {
					if (target.hp <= 0 || me.hp <= 0) break;
					me.mp -= cost;
					me.do_attack({
						target: target,
						gj: cost,
						attack_msg: thunderMsgs[i]
					});
					me.mp += cost;
					me.send_room("<HIG>$N击中$n，内力回流！</HIG>", target);
					totalDmg += cost;
					hits++;
					if (target.hp <= 0) break;
				}

				if (hits >= 5 && target.hp > 0) {
					var bonus = Math.floor(me.max_mp * 0.5);
					var atk = me.do_attack({
						target: target,
						gj: bonus,
						attack_msg: "<HIR>五击连中！$N引动九天惊雷，对$n造成" + bonus + "点额外伤害！</HIR>"
					});
					totalDmg += bonus;
				}

				me.end_attack(target);
				me.send_room("<HIR>$N的惊雷爆五岳共计" + hits + "连击！</HIR>", target);
			},
			query_desc: function (me, lv) {
				return "消耗10%最大内力发动连击，每击造成等量伤害，命中则返还消耗内力并继续连击。最多五连击，五击全中则额外造成50%最大内力的伤害。";
			}
		},
		tianlei: {
			name: "天打雷劈屠真龙",
			distime: 45000,
			enable_skill: "force",
			release_time: 2500,
			mp: 40,
			use: function (me, target, lv) {
				me.send_room("<HIM>$N仰天长啸，紫电劲冲霄而起——「天打雷劈屠真龙」！</HIM>");
				me.send_room("<HIY>九天之雷应声而下，$N周身紫电缠绕，$n被雷光击中！</HIY>", target);

				me.do_attack({
					target: target,
					gj: me.gj * 2,
					attack_msg: "<HIR>$N的天雷之力对$n造成重创！</HIR>"
				});

				var bonus = 10 + parseInt(lv / 100);
				me.add_status({
					id: "zidian_power",
					name: "紫电",
					desc: "攻击+" + bonus + "%，命中+" + bonus + "%",
					duration: 5000 + parseInt(lv * 10),
					downside: false,
					override: 2,
					prop: {
						gj_per: bonus,
						mz_per: bonus,
					},
					start_msg: "<HIY>$N周身紫电缠绕，气势暴涨！</HIY>",
					finish_msg: "$N周身的紫电渐渐消散。",
				});

				var malaPct = 20 + parseInt(lv / 100);
				if (malaPct > 40) malaPct = 40;
				var malaDuration = 8000 + lv * 5;
				if (malaDuration > 20000) malaDuration = 20000;
				target.add_status({
					id: "zidian_mabi",
					name: "麻痹",
					desc: "攻击速度+" + malaPct + "%，冷却+" + malaPct + "%，出招+" + malaPct + "%",
					duration: malaDuration,
					downside: true,
					override: 2,
					prop: {
						gjsd_per: malaPct,
						distime_per: malaPct,
						releasetime_per: malaPct,
					},
					start_msg: "<HIM>$n被紫电击中，全身麻痹，动作迟缓！</HIM>",
					finish_msg: "$n的麻痹效果消失了。",
				}, me);

				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				var bonus = 10 + parseInt(lv / 100);
				var malaPct = 20 + parseInt(lv / 100);
				if (malaPct > 40) malaPct = 40;
				var malaDuration = (8000 + lv * 5) / 1000;
				if (malaDuration > 20) malaDuration = 20;
				return "引天雷之力，造成200%攻击力的伤害，自身获得「紫电」buff（攻击+" + bonus + "%，命中+" + bonus + "%，持续" + (5 + parseInt(lv * 10 / 1000)) + "秒），敌人获得「麻痹」debuff（攻速/冷却/出招+" + malaPct + "%，持续" + malaDuration + "秒）。";
			}
		}
	};
