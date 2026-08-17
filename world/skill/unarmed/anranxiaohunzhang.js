this.inherits(SKILL);
this.name = "黯然销魂掌";
this.id = "anranxiaohunzhang";
this.grade = 5;
this.is_public = true;
this.attack_actions = [
	"$N黯然销魂，一掌「无中生有」，掌力若有若无地拍向$n的$l",
	"$N心意沉沉，一招「呆若木鸡」，掌风凝滞如岳压向$n",
	"$N愁眉深锁，一掌「徘徊空谷」，掌劲跌宕起伏直取$n的$l",
	"$N神色黯然，一招「饮恨吞声」，掌力吞吐不定地击向$n",
	"$N形神俱疲，一掌「魂牵梦萦」，内力绵绵不绝地涌向$n",
	"$N黯然神伤，一招「六神不安」，掌法散乱中暗藏杀机击向$n",
	"$N面如死灰，一招「力不从心」，看似无力实则暗劲汹涌袭向$n"
];
this.desc = "神雕大侠杨过和小龙女分开后，因为刻骨思念之情而创出的一路掌法，黯然销魂者，唯别而已矣";
this.can_enables = ["unarmed"];
this.learn_condition = {
	max_mp: 10000,
	skill: { unarmed: 1000 }
};

this.query_enable_prop = function (lv) {
	return {
		unarmed: {
			gj: parseInt(lv * 2320 / 1000),
			mz: parseInt(lv * 1720 / 1000),
			int: parseInt(lv * 262 / 1000),
			con: parseInt(lv * 262 / 1000),
			diff_downside_per: 10,
		},
	};
};

this.pfm = {
	wuzhong: {
		name: "无中生有",
		distime: 19000,
		enable_skill: "unarmed",
		release_time: 3800,
		mp: 30,
		use: function (me, target, lv) {
			me.send_room("<HIM>$N黯然神伤，掌中忽生忽灭，施展出「无中生有」！</HIM>", target);
			me.do_attack({
				target: target,
				gj: me.gj * 2,
				attack_msg: "<HIM>$N的掌力若有若无，虚实难辨地向$n拍去！</HIM>"
			});
			// 命中后偷取敌人一个正面buff（内联处理，不依赖on_attack_over）
			if (target.status && target.status.length > 0) {
				for (var i = target.status.length - 1; i >= 0; i--) {
					var st = target.status[i];
					if (!st.downside && !st.no_steal && !st.is_busy && !st.is_faint && !st.is_miss && !st.is_rash) {
						target.remove_status(st.id);
						me.add_status({
							id: st.id + "_stolen",
							name: st.name,
							desc: st.desc + "(偷取)",
							duration: st.duration || 10000,
							prop: st.prop,
						});
						me.send_room("<HIM>$N以「无中生有」偷取了$n的" + st.name + "状态！</HIM>", target);
						break;
					}
				}
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "对敌人造成200%的伤害，命中后会偷取敌人的一个正面状态附加自身";
		}
	},
	daimu: {
		name: "呆若木鸡",
		distime: 35000,
		enable_skill: "unarmed",
		release_time: 3800,
		mp: 35,
		use: function (me, target, lv) {
			me.send_room("<HIR>$N面如死灰，呆立当场，猛地一掌拍出——「呆若木鸡」！</HIR>", target);
			var sh = me.do_attack({
				target: target,
				gj: me.gj * 2.66,
				mz: me.mz * 2,
				attack_msg: "<HIR>$N的掌力凝如实质，带着万钧之势压向$n！</HIR>"
			});
			if (sh) {
				target.add_status({
					id: "anran_chidun",
					name: "迟钝",
					desc: "攻击速度和技能释放速度降低" + (50 + parseInt(lv / 100)) + "%",
					duration: 5000 + parseInt(lv * 5),
					only_combat: true,
					downside: true,
					prop: {
						distime_per: -(50 + parseInt(lv / 100)),
						releasetime_per: -(50 + parseInt(lv / 100)),
					},
					start_msg: "<HIR>$N被「呆若木鸡」震慑，动作变得迟缓无比！</HIR>",
					finish_msg: "$N的「呆若木鸡」迟钝效果消失了。",
				}, me);
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "超高命中的一击，对敌人造成266%的伤害，命中减少对方" + (50 + parseInt(lv / 100)) + "%攻击速度和技能释放速度";
		}
	}
};
