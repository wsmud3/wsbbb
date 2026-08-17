this.inherits(SKILL);
this.name = "九阴神功";
this.id = "jiuyinshengong";
this.grade = 5;
this.force_rad = 0.9;
this.desc = "黄裳所创的道家无上内功心法，记载于九阴真经，包罗万象，天下武学总纲";
this.can_enables = ["force"];
this.learn_condition = {
	max_mp: 5000,
	skill: { force: 500 }
};

// 九阴劲气被动：命中后叠加debuff（通过on_force_over确保每次攻击都触发）
this.on_force_over = function (me, target, par, sh) {
	if (sh > 0 && target && target.hp > 0) {
		target.add_status({
			id: "jiuyin_jq",
			name: "九阴",
			desc: "攻击、躲闪、命中降低1%",
			duration: 10000 + parseInt(lv * 5),
			only_combat: true,
			downside: true,
			override: 1,
			max_count: 10,
			prop: { gj_per: -parseInt(lv * 1 / 1000), ds_per: -parseInt(lv * 1 / 1000), mz_per: -parseInt(lv * 1 / 1000) },
		}, me);
		// Update name to show current stack count
		if (target.status) {
			for (var k = 0; k < target.status.length; k++) {
				if (target.status[k].id === "jiuyin_jq") {
					var c = target.status[k].count;
					target.status[k].name = "九阴×" + c;
					target.status[k].desc = "攻击、躲闪、命中降低" + c + "%";
				}
			}
		}
	}
};

this.query_enable_prop = function (lv) {
	return {
		force: {
			max_hp: lv * 20,
			mz: parseInt(lv * 2400 / 1000),
			diff_fy_per: 6,
			limit_mp: lv * 285,
			desc: "命中后会使敌人减少攻击、躲闪、命中1%(可叠加10层)\n将你内力的90%转化为气血",
		},
	}
}

this.pfm = {
	zhuihun: {
		name: "追魂",
		distime: 30000,
		enable_skill: "force",
		release_time: 4000,
		mp: 20,
		use: function (me, target, lv) {
			if (!target) return me.notify("你要用追魂对付谁？");
			me.send_room("<HIR>$N施展九阴神功「追魂」，引爆九阴劲气！</HIR>", target);
			var stacks = target.query_status("jiuyin_jq");
			if (stacks > 0) {
				// 每层造成25755真实伤害
				var trueDmg = stacks * 25755;
				target.damage(trueDmg, me);
				me.send_room("<HIR>$N引爆了" + target.name + "身上" + stacks + "层九阴劲气，造成" + trueDmg + "点真实伤害！</HIR>", target);
				// 层数大于5层昏迷6秒
				if (stacks > 5) {
					target.add_status({
						id: "jiuyin_faint",
						name: "昏迷",
						desc: "被九阴追魂震昏",
						duration: Math.min(1000 + parseInt(lv * 5), 6000),
						only_combat: true,
						downside: true,
						is_faint: true,
						start_msg: "<HIR>$n被九阴追魂之力震昏！</HIR>",
						finish_msg: "$n从昏迷中醒来。",
					}, me);
				}
				// 清除所有九阴劲气层数
				target.remove_status("jiuyin_jq", true);
			} else {
				me.do_attack({target: target, gj: me.gj * 1.5});
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "引爆敌人身上的九阴劲气，每层造成25755的真实伤害，层数大于5层将使敌方昏迷" + (Math.min(1000 + parseInt(lv * 5), 6000) / 1000) + "秒";
		}
	},
	nizhuan: {
		name: "逆转九阴",
		distime: 60000,
		enable_skill: "force",
		release_time: 0,
		mp: 20,
		use: function (me, target, lv) {
			me.send_room("<HIM>$N逆转九阴神功，全力爆发！</HIM>");
			me.add_status({
				id: "force",
				name: "逆转九阴",
				desc: "攻击+" + (30 + parseInt(lv / 100)) + "%，无视防御+" + (30 + parseInt(lv / 100)) + "%，攻击速度+" + (10 + parseInt(lv / 100)) + "%，防御-" + (30 + parseInt(lv / 100)) + "%，伤害减免-" + (30 + parseInt(lv / 100)) + "%",
				duration: 1000 + parseInt(lv * 10),
				downside: false,
				override: 2,
				prop: {
					gj_per: 30 + parseInt(lv / 100),
					diff_fy_per: 30 + parseInt(lv / 100),
					gjsd_per: 10 + parseInt(lv / 100),
					fy_per: -(30 + parseInt(lv / 100)),
					diff_sh_per: -(30 + parseInt(lv / 100)),
				},
				start_msg: "<HIM>$N逆转九阴，全力攻击！</HIM>",
				finish_msg: "$N的逆转九阴效果消失了。",
			});
		},
		query_desc: function (me, lv) {
			return "逆转九阴，全力攻击，" + (1 + parseInt(lv * 10 / 1000)) + "秒内增加你" + (30 + parseInt(lv / 100)) + "%的攻击，" + (30 + parseInt(lv / 100)) + "%的无视防御，" + (10 + parseInt(lv / 100)) + "%的攻击速度，减少你" + (30 + parseInt(lv / 100)) + "%的防御和伤害减免";
		}
	}
};
