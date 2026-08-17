	this.inherits(SKILL);
	this.name = "紫电劲";
	this.id = "zidianjin";
	this.grade = 3;
	this.family = FAMILIES.SUNV;
	this.force_rad = 0.9;
	this.desc = "素女道秘传内功刀法，相传为一位无名霸王所留。以紫电之力灌注刀身，可发雷霆一击，亦可引天雷之力加持己身、麻痹敌手";
	this.can_enables = ["blade", "force"];
	this.learn_condition = { max_mp: 1500, skill: { blade: 150, force: 100 } };

	this.query_enable_prop = function (lv) {
		return {
			blade: {
				gj: parseInt( lv * 1.7 + 50),
				mz: parseInt( lv * 1.7 + 50),
				limit_mp: lv * 150,
			},
			force: {
				max_hp: lv * 8,
				fy: parseInt(lv * 1.2),
			}
		};
	}

	this.pfm = {
		chunlei: {
			name: "春雷暴殛",
			distime: 15000,
			enable_skill: "blade",
			release_time: 3000,
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<HIR>$N凝聚紫电劲于刀身，一式「春雷暴殛」如霹雳般向$n劈去！</HIR>", target);
				me.do_attack({
					target: target,
					gj: me.gj * 5,
					attack_msg: "<HIR>$N的春雷暴殛正中$n！</HIR>"
				});
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "以紫电劲灌注刀身，简单一劈，实而不华，造成500%攻击力的伤害。";
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
				var malaDuration = (Math.min(8000 + lv * 5, 20000) / 1000);
				return "引天雷之力，造成200%攻击力的伤害，自身获得「紫电」buff（攻击+" + bonus + "%，命中+" + bonus + "%，持续" + (5 + parseInt(lv * 10 / 1000)) + "秒），敌人获得「麻痹」debuff（攻速/冷却/出招+" + malaPct + "%，持续" + malaDuration + "秒）。";
			}
		}
	};
