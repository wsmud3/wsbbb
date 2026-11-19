this.inherits(SKILL);
this.name = "无念禅功";
this.id = "wunianchangong";
this.grade = 5;
this.force_rad = 1.0;
this.desc = "净念禅宗的内功心法，以无念无想之境臻至佛门禅定，防御无双。\n唯一：将你内力的100%转化为气血";
this.can_enables = ["force"];
this.learn_condition = {
	skill: { force: 800 }
};
this.query_enable_prop = function (lv) {
	return {
		force: {
			max_hp: lv * 30,
			fy: parseInt(lv * 3005 / 1000),
			hp_per: 13,
			fy_per: 13,
			diff_sh_per: 8,
			limit_mp: lv * 250,
			desc: "绝招：净念（清负面清敌增益） 无念（减伤+内力附加伤害） 闭口禅（内力伤害+禁绝招）",
		}
	};
};
// 无念期间（内功位）：每次攻击附加最大内力 1% 的伤害（作为内力伤害并入本次攻击）。
// 原先只用 on_attach 设了一个 wunian_active 标记，没有任何地方读取，附加伤害从未生效。
this.do_force_attack = function (me, target, par) {
	if (!me.status) return 0;
	for (var i = 0; i < me.status.length; i++) {
		var st = me.status[i];
		// 状态 id 是通用的 "force"（覆盖替换时只同步 name 等字段），按名称识别无念
		if (st.id === "force" && st.name === "无念") return Math.floor((me.max_mp > 0 ? me.max_mp : 0) * 0.01);
	}
	return 0;
};
this.pfm = {
	pfm1: {
		name: "净念",
		distime: 25000,
		enable_skill: "force",
		release_time: 0,
		use_type: 2,
		allow_busy: true,
		mp: 20,
		use: function (me, target, lv) {
			me.send_room("<hic>$N双手合十，念诵佛号，无念禅功之「净念」涤荡一切！</hic>", target);
			me.clear_downside(true);
			if (target && target.status) {
				for (var i = target.status.length - 1; i >= 0; i--) {
					var st = target.status[i];
					if (!st.downside && !st.no_clear) {
						target.remove_status(st.id, true);
					}
				}
			}
			me.notify("<hig>净念发动：你的负面状态已清除，敌人的增益状态已净化！</hig>");
		},
		query_desc: function (me, lv) {
			return "清除自身负面状态和敌人的正面状态。";
		}
	},
	pfm2: {
		name: "无念",
		distime: 25000,
		enable_skill: "force",
		release_time: 3000,
		use_type: 2,
		allow_busy: true,
		mp: 20,
		use: function (me, target, lv) {
			me.send_room("<hio>$N闭目凝神，进入无念之境，周身佛光护体！</hio>", target);
			me.add_status({
				id: "force",
				name: "无念",
				desc: "伤害减免+" + (23 + parseInt(lv / 100)) + "%，攻击附加最大内力1%伤害",
				duration: Math.min(parseInt(lv * 10), 10000),
				downside: false,
				override: 2,
				prop: { diff_sh_per2: 23 + parseInt(lv / 100) },
				start_msg: "<hio>$N的防御大幅提升，攻击中蕴含佛力！</hio>",
				finish_msg: "$N的无念状态消散了。",
			});
		},
		query_desc: function (me, lv) {
			return "" + (Math.min(parseInt(lv * 10), 10000) / 1000) + "秒内增加" + (23 + parseInt(lv / 100)) + "%伤害减免，每次攻击附加最大内力1%的伤害。";
		}
	},
	pfm3: {
		name: "闭口禅",
		distime: 45000,
		enable_skill: "force",
		release_time: 0,
		use_type: 2,
		allow_busy: true,
		mp: 20,
		use: function (me, target, lv) {
			me.send_room("<hir>$N口中默念真言，无念禅功之「闭口禅」禁绝万法！</hir>", target);
			if (target && target.hp > 0) {
				var forceDmg = Math.floor(me.max_mp * 0.15);
				target.damage2(forceDmg, me);
				target.add_status({
					// 状态 id 必须是 "bikou"：出招分派在 no_pfm 时会 remove_status("bikou")，即只禁「下一个」绝招。
					// 原先 id 是 bikou_jin，移除不掉，整段时间内所有绝招都被禁。
					id: "bikou",
					name: "闭口禅禁制",
					desc: "被闭口禅禁制，无法使用下一个绝招",
					duration: Math.min(7000 + parseInt(lv * 5), 10000),
					downside: true,
					override: 2,
					prop: { no_pfm: 1 },
					start_msg: "<hir>$N被闭口禅禁制，下一个绝招无法释放！</hir>",
					finish_msg: "$N的闭口禅禁制解除了。",
				});
				me.notify("<hir>闭口禅发动：造成" + forceDmg + "点内力伤害，" + (Math.min(7000 + parseInt(lv * 5), 10000) / 1000) + "秒内封印对方下一个绝招！</hir>");
			}
		},
		query_desc: function (me, lv) {
			return "造成15%内力上限伤害，" + (Math.min(7000 + parseInt(lv * 5), 10000) / 1000) + "秒内禁止对方下一个绝招。";
		}
	}
};
