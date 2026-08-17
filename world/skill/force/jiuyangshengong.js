this.inherits(SKILL);
this.name = "九阳神功";
this.id = "jiuyangshengong";
this.grade = 5;
this.force_rad = 1.0;
this.desc = "斗酒神僧所创的绝世内功，至刚至阳，练成后内力雄浑无比，百毒不侵";
this.can_enables = ["force"];
this.learn_condition = {
	max_mp: 5000,
	skill: { force: 500 }
};

// 被动反震：被命中后对敌人造成反震伤害（1000级≈5333），九阳护体期间翻倍
this.on_damage = function (me, from, sh) {
	if (from && from.hp > 0 && sh > 0) {
		var lv = me.query_skill("jiuyangshengong");
		var fz = 2000 + Math.floor(lv * 3.333);
		if (me.query_temp("jiuyang_ht")) fz = fz * 2;
		from.damage(fz, me);
		me.send_room("<HIY>$N的九阳神功反震，" + from.name + "受到了" + fz + "点反震伤害！</HIY>");
	}
	return sh;
};

this.query_enable_prop = function (lv) {
	return {
		force: {
			fy: lv * 3.1,
			fy_per: 5 + Math.floor(lv / 100),
			diff_sh_per: 2 + Math.floor(lv / 250),
			hp_per: 2 + Math.floor(lv / 250),
			limit_mp: lv * 290,
			desc: "被命中后对敌人造成反震伤害(1000级≈5333)\n将你内力的100%转化为气血",
		},
	}
}

this.pfm = {
	huti: {
		name: "九阳护体",
		distime: 60000,
		enable_skill: "force",
		release_time: 0,
		mp: 20,
		use: function (me, target, lv) {
			var dr = 30 + Math.floor(lv / 33.3);
			me.send_room("<HIY>$N将九阳真气布满全身——「九阳护体」！</HIY>");
			me.add_status({
				id: "force",
				name: "九阳护体",
				desc: "伤害减免+" + dr + "%，反震伤害翻倍",
				duration: parseInt(lv * 10),
				downside: false,
				override: 2,
				prop: { diff_sh_per: dr },
				start_msg: "<HIY>$N九阳真气护体，坚不可摧！</HIY>",
				finish_msg: "$N的九阳护体效果消失了。",
				on_attach: function (p) {
					p.set_temp("jiuyang_ht", 1);
				},
				on_expire: function (p) {
					p.remove_temp("jiuyang_ht");
				},
			});
		},
		query_desc: function (me, lv) {
			var dr = 30 + Math.floor(lv / 33.3);
			return "将九阳真气布满全身，" + (parseInt(lv * 10 / 1000)) + "秒内增加你" + dr + "%的伤害减免，反震伤害加倍。";
		}
	},
	zhenyan: {
		name: "九阳真焰",
		distime: 40000,
		enable_skill: "force",
		release_time: 4000,
		mp: 20,
		use: function (me, target, lv) {
			me.send_room("<HIY>$N催动九阳真气，熊熊烈焰扑向$n——「九阳真焰」！</HIY>", target);
			me.do_attack({target: target, gj: me.gj * 1.5});
			// 施加阳炎debuff
			var casterId = me.id;
			target.add_status({
				id: "force",
				name: "阳炎",
				desc: "每" + ((7000 + parseInt(lv * 5)) / 1000) + "秒受到" + me.name + "当前气血6%的内功伤害，且无法使用内功buff",
				duration: 7000 + parseInt(lv * 5),
				downside: true,
				override: 0,
				duration_count: 4,
				on_interval: function (who, count) {
					var caster = who.environment ? who.environment.find_obj(casterId) : null;
					if (!caster || caster.hp <= 0) return false;
					var dmg = Math.floor(caster.hp * 0.06);
					if (dmg > 0) {
						who.damage(dmg, caster);
						who.send_room("<HIY>阳炎灼烧，" + who.name + "受到了" + dmg + "点内功伤害！</HIY>");
					}
				},
				start_msg: "<HIY>$n被九阳真焰灼烧，周身烈焰环绕！</HIY>",
				finish_msg: "$n身上的九阳真焰熄灭了。",
			}, me);
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "对敌人造成伤害，命中后" + ((7000 + parseInt(lv * 5)) * 4 / 1000) + "秒内每" + ((7000 + parseInt(lv * 5)) / 1000) + "秒受到你当前气血6%的内功伤害(阳炎抢占force位，敌人无法使用内功buff)。";
		}
	}
};
