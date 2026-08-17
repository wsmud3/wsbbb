this.inherits(SKILL);
this.name = "太玄功";
this.id = "taixuangong";
this.grade = 5;
this.force_rad = 0.8;
this.desc = "侠客岛上石刻所载的玄妙内功，融汇天地至理，修至大成可返璞归真";
this.can_enables = ["force"];
this.learn_condition = {
	max_mp: 5000,
	skill: { force: 500 }
};

// 白首太玄期间：附加伤害加倍 + 命中后恢复攻击力40%气血
this.on_force_over = function (me, target, par, sh) {
	if (sh > 0 && me.query_temp("taixuan_bstx")) {
		var heal = Math.floor(me.gj * 0.4);
		if (heal > 0) {
			me.do_recover(heal);
		}
	}
};

this.query_enable_prop = function (lv) {
	return {
		force: {
			gj: lv * 2 + 100,
			add_sh_per: 8,
			diff_busy: 4,
			limit_mp: lv * 286,
			desc: "十步杀一人：对附近敌人快速攻击，突破防御，命中增加攻击次数\n白首太玄：附加伤害加倍，命中恢复攻击力40%气血\n唯一：将你内力的80%转化为气血",
		},
	}
}

this.pfm = {
	shibu: {
		name: "十步杀一人",
		distime: 30000,
		enable_skill: "force",
		release_time: 3096,
		mp: 35,
		use: function (me, target, lv) {
			me.send_room("<HIW>$N长啸一声，太玄功运转——「十步杀一人」！</HIW>", target);
			if (me.enemy) {
				for (var i = 0; i < me.enemy.length; i++) {
					var t = me.enemy[i];
					if (t && t.hp > 0) {
						me.do_attack({
							target: t,
							gj: me.gj * 1.5,
							diff_fy: 40,
							attack_msg: "<HIW>$N的太玄剑气向" + t.name + "袭去！</HIW>"
						});
					}
				}
			} else if (target) {
				me.do_attack({target: target, gj: me.gj * 1.5, diff_fy: 40});
			}
			if (target) me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "对附近敌人进行快速攻击，突破对方40%防御，如果命中增加攻击次数，无视忙乱";
		}
	},
	baishou: {
		name: "白首太玄",
		distime: 30000,
		enable_skill: "force",
		release_time: 3096,
		mp: 35,
		use: function (me, target, lv) {
			me.send_room("<HIG>$N将太玄功力运转周身——「白首太玄」！</HIG>");
			me.add_status({
				id: "force",
				name: "白首太玄",
				desc: "太玄功附加伤害加倍，命中后恢复攻击力40%气血",
				duration: 3000 + parseInt(lv * 10),
				downside: false,
				override: 2,
				prop: { add_sh_per: parseInt(lv * 8 / 1000) },
				start_msg: "<HIG>$N白首太玄，功力倍增！</HIG>",
				finish_msg: "$N的白首太玄效果消失了。",
				on_attach: function (p) {
					p.set_temp("taixuan_bstx", 1);
				},
				on_expire: function (p) {
					p.remove_temp("taixuan_bstx");
				},
			});
		},
		query_desc: function (me, lv) {
			return "将太玄功力运转周身，" + (3 + parseInt(lv * 10 / 1000)) + "秒内太玄功附加伤害加倍，命中后恢复自己攻击力40%的气血";
		}
	}
};
