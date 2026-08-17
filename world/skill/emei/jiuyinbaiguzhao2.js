this.inherits(SKILL);
this.name = "九阴白骨爪";
this.id = "jiuyinbaiguzhao2";
this.source_skill = "jiuyinbaiguzhao";
this.grade = 4;
this.family = FAMILIES.EMEI;
this.desc = "九阴真经里记载的外门功夫，阴狠毒辣，已练至大成";
this.attack_actions = [
				"$N左爪虚晃，右爪蓄力，一招「勾魂夺魄」直插向$n的$l",
				"$N双手连环成爪，爪爪钩向$n，「九子连环」已向$n的$l抓出",
				"$N双手使出「十指穿心」，招招不离$n的$l",
				"$N身形围$n一转，使出「天罗地网」，$n的$l已完全笼罩在爪影下",
				"$N使一招「风卷残云」，双爪幻出满天爪影抓向$n全身",
				"$N吐气扬声，一招「唯我独尊」双爪奋力向$n天灵戳下"
];
this.can_enables = ["unarmed"];
this.learn_condition = {
				max_mp: 4000,
				skill: { unarmed: 400 }
};

this.on_before_attack = function (me, target, par) {
				if (!target || target.hp <= 0) return;
				var hp_percent = target.hp / target.max_hp;
				var missing = Math.floor((1 - hp_percent) * 100);
				if (missing > 0) {
		if (!par.gj) par.gj = me.gj;
		if (!par.mz) par.mz = me.mz;
		var sk = me.skills[this.id];
		var lv = sk ? sk.level : 0;
		var scale = 1 + Math.sqrt(Math.min(lv, 2000) / 2000);
		par.gj = parseInt(par.gj * (100 + missing * scale) / 100);
		par.mz = parseInt(par.mz * (100 + missing * scale) / 100);
		par.wuqing = missing;
	}
}

this.on_attack_over = function (me, target, par, sh) {
				if (par.wuqing) {
		var sk = me.skills[this.id];
		var lv = sk ? sk.level : 0;
		var scale = 1 + Math.sqrt(Math.min(lv, 2000) / 2000);
		var mult = 100 + par.wuqing * scale;
		par.gj = parseInt(par.gj * 100 / mult);
		par.mz = parseInt(par.mz * 100 / mult);
	}
}

this.query_enable_prop = function (lv) {
				return {
		unarmed: {
												gj: 1300,
												mz: 1220,
												desc: "无情：敌人每失去1%气血，你的九阴白骨爪伤害和命中提高1%~2%（随等级成长，非线性的，2000级满）"
								}
	};
}
this.pfm = {
				po:
				{
		name: "夺魄",
		distime: 18000,
		enable_skill: "unarmed",
		weapon_type: WEAPON_TYPE.UNARMED,
		mp: 20,
		use: function (me, target, lv) {
												var gj = me.gj * 300 / 100;
												if (me.do_attack({
																target: target,
																gj: gj,
																mz: me.mz,
																no_weapon: true,
																attack_msg: "<hiy>$N冷笑数声，手指微微弯曲成爪，身形疾转，飞向$n头顶抓下</hiy>",
																damage_msg: "<hir>$n哪里料到$N竟有如此变招，不及躲闪，被$P抓了个鲜血淋漓，头痛欲裂。</hir>"
												})) {
																target.add_status({
																				id: "miss",
																				name: "昏迷",
																				desc: "你昏迷不醒",
																				is_faint: true,
																				duration: Math.min(3000 + parseInt(lv * 5), 8000),
																				downside: true
																});
												}
												me.end_attack(target);
								},
		query_desc: function (me, lv) {
												return"快速狠辣的攻击，命中后对敌人造成你攻击力300%的伤害，在" + (3 + parseInt(lv * 5 / 1000)) + "秒内使敌人昏迷。";
								}
	}, juan:
				{
		name: "风卷残云",
		distime: 18000,
		enable_skill: "unarmed",
		weapon_type: WEAPON_TYPE.UNARMED,
		mp: 20,
		use: function (me, target, lv) {
												var hp_per = 30 - lv / 100;
												if (hp_per < 10) hp_per = 10;
												var count = parseInt((100 - target.hp * 100 / target.max_hp) / hp_per) + 3;
												me.send_room("<hir>$N一声厉啸，手指弯曲成爪，身形疾转，双爪化为一片残影，飞向$n抓去</hir>\n", target);
												for (var i = 0; i < count; i++) {
																me.do_attack({
																				target: target,
																				gj: me.gj,
																				mz: me.mz,
																				no_weapon: true
																});
												}
												me.end_attack(target);
								},
		query_desc: function (me, lv) {
												var hp_per = 30 - lv / 100;
												if (hp_per < 10) hp_per = 10;
												return"对敌人进行快速攻击3次，对方的气血每降低" + hp_per +"%，你的攻击次数增加1次";
								}
	}
};
