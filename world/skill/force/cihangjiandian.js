this.inherits(SKILL);
this.name = "慈航剑典";
this.id = "cihangjiandian";
this.grade = 6;
this.force_rad = 1.5;
this.desc = "上古四大奇书之一，慈航静斋的镇派绝学。传说可通明剑心，臻至无上剑道。";
this.can_enables = ["force"];
this.learn_condition = {
	skill: { force: 800 }
};

this.query_enable_prop = function (lv) {
	return {
		force: {
			gj: parseInt(lv * 3.1),
			mz: parseInt(lv * 3.1),
			mz_per: 10,
			add_sh_per: parseInt(lv / 100),
			diff_fy_per: parseInt(lv / 100),
			limit_mp: lv * 900,
			desc: "震慑：进入战斗时所有敌人降低躲闪和招架" + zhenshe_per(lv) + "%\n灵动：战斗开始5秒内无法被控制\n唯一：将你内力的120%转化为气血",
		},
	};
};

// 震慑：躲闪、招架 -(5 + lv/300)%（2300 级 12%）
function zhenshe_per(lv) { return 5 + parseInt((lv || 0) / 300); }

// 每个新敌人进战时施加震慑（不可驱散的增益buff，效果为减益，类似和氏璧和长生诀）
this.on_new_enemy = function (me, target) {
	if (target && target.hp > 0) {
		var per = zhenshe_per(me.query_skill("cihangjiandian", 0));
		target.add_status({
			id: "cihang_zhenshe",
			name: "震慑",
			desc: "被慈航剑典剑意震慑，躲闪和招架降低" + per + "%",
			duration: 86400000,
			downside: false,
			no_clear: true,
			override: 2,
			only_combat: true,
			prop: { ds_per: -per, zj_per: -per },
		}, me);
	}
};

// 首次进战时触发灵动 + 群体驱散
this.on_beginfight = function (me, target) {
	var lv = me.query_skill("cihangjiandian", 0); // 原先引用了未定义的 lv，触发即 ReferenceError
	// 群体驱散：驱散房间内所有敌人的增益buff，不驱散绿色debuff
	var room = me.environment;
	if (room) {
		for (var j = 0; j < room.items.length; j++) {
			var enemy = room.items[j];
			if (enemy === me || !enemy.status || !enemy.status.length) continue;
			if (enemy.is_player && !me.is_fighting(enemy)) continue;
			enemy.clear_downside(false);   // 驱散全部可驱散的增益
		}
	}
	me.add_status({
		id: "cihang_lingdong",
		name: "灵动",
		desc: "剑心通明，无法被控制",
		duration: parseInt(lv * 10),
		downside: false,
		override: 2,
		prop: { ig_control: 1 },
		start_msg: "<hio>$N的慈航剑典剑意流转，进入灵动状态，无法被控制！</hio>",
		finish_msg: "$N的灵动状态消散了。",
	});
};

this.on_damage = function (me, from, sh) {
	return sh;
};

this.pfm = {
	xinyoulx: {
		name: "心有灵犀",
		distime: 30000,
		release_time: 4000,
		enable_skill: "force",
		use_type: 2,
		allow_busy: true,
		allow_faint: true,
		mp: 1890,
		use: function (me, target, lv) {
			me.send_room("<hio>$N催动慈航剑典，剑心流转，进入心有灵犀之境！</hio>");
			me.add_status({
				id: "cihang_xylx",
				name: "心有灵犀",
				desc: "攻击命中对方后触发多次攻击，且免疫控制",
				duration: parseInt(lv * 10),
				downside: false,
				override: 2,
				prop: { ig_control: 1 },
				start_msg: "<hio>$N心有灵犀，剑意通明，攻击将触发多次！</hio>",
				finish_msg: "$N的心有灵犀状态消散了。",
				// 每次命中追加 2～4 次攻击：写在状态上（原在慈航剑典的 on_force_over），融入自创武学后照常生效
				on_force_over: function (owner, target, par, sh) {
					if (sh <= 0 || !target || target.hp <= 0) return;
					var extra_count = 2 + Math.floor(Math.random() * 3);
					for (var i = 0; i < extra_count; i++) {
						if (target.hp <= 0) break;
						owner.do_attack({ target: target, gj: parseInt(owner.gj * 0.6), mz: owner.mz, no_append: true });
					}
				},
			});
		},
		query_desc: function (me, lv) {
			return "" + (parseInt(lv * 10 / 1000)) + "秒内攻击命中对方后将触发多次攻击，并且免疫控制。";
		}
	},
	jianxtm: {
		name: "剑心通明",
		distime: 60000,
		release_time: 4000,
		enable_skill: "force",
		use_type: 2,
		mp: 2150,
		query_distime: function (me, lv, isref) {
			var dis = this.distime;
			if (!(dis >= 0)) dis = me.gjsd;
			if (isref) dis = dis * 2;
			dis = dis - me.query_prop_no_buff("distime");
			if (dis <= 0) dis = 0;
			dis = dis - dis * me.query_prop_no_buff("distime_per") / 100;
			if (dis < 0) dis = 0;
			if (dis < 4000) dis = 4000;
			return parseInt(dis);
		},
		use: function (me, target, lv) {
			me.send_room("<hio>$N将慈航剑典催动至极限，进入剑心通明之境，周身剑气纵横！</hio>");
			var sword_bonus = 0;
			var weapon = me.query_weapon();
			if (weapon && weapon.weapon_type === WEAPON_TYPE.SWORD) {
				sword_bonus = 40;
			}
			me.add_status({
				id: "force",
				name: "剑心通明",
				desc: "" + (parseInt(lv * 10 / 1000)) + "秒内进入剑心通明状态，出招速度和冷却速度缩减到极限，洞悉对方弱点绝对命中招架" + (sword_bonus > 0 ? "，如果装备剑伤害增加40%" : ""),
				duration: parseInt(lv * 10),
				downside: false,
				override: 2,
				prop: {
					gjsd_per: 80 + parseInt(lv / 100),
					releasetime_per: 90 + parseInt(lv / 100),
					distime_per: 89 + parseInt(lv / 100),
					gj_per: sword_bonus,
				},
				start_msg: "<hio>$N剑心通明，出招如电，洞悉一切！</hio>",
				finish_msg: "$N的剑心通明状态消散了。",
				// 必中必招架、绝对招架：写在状态上（原在慈航剑典的 on_before_attack / on_force_parry）
				on_before_attack: function (owner, target, par) { par.no_dodge = true; par.no_parry = true; },
				on_force_parry: function (owner, from, sh) {
					owner.send_room("<hio>$N剑心通明，剑气护体，将$n的攻势尽数化解！</hio>", from);
					return sh;
				},
			});
		},
		query_desc: function (me, lv) {
			return "所有技能CD降为4秒(不包含自身)，必中，绝对招架（招架所有类型伤害），装备剑时伤害增加40%。";
		}
	}
};
