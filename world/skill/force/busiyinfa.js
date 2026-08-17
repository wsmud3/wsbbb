this.inherits(SKILL);
this.name = "不死印法";
this.id = "busiyinfa";
this.grade = 6;
this.force_rad = 1.3;
this.desc = "邪王石之轩融汇毕生所学创出的至高武学，以生死二气为根基，可将对手的攻势化为己用。练至大成，真气生生不息，近乎不死不灭。";
this.can_enables = ["force", "dodge"];

this.dodge_actions = [
	"$n身影一晃，化作数道残影，$N的攻击只击中了一片虚空。",
	"$n负手而立，待到$N攻势及身，仅侧身半步，杀招便尽数落空。",
	"$n单掌虚引，$N眼前一花，明明近在咫尺的$n竟如隔天涯。",
	"$n不退反进，飘然欺近$N身前，未待拳脚发力，已如鬼魅般贴身滑开。",
	"$n身形如一缕青烟般飘散，$N的攻击穿过残影，$n已在三丈之外。",
	"$n迎着$N的攻势踏前一步，在毫厘之间化作虚影，$N只击中了空气。"
];

this.query_enable_prop = function (lv) {
	return {
		force: {
			fy_per: parseInt(lv * 0.012),
			hp_per: parseInt(lv * 0.012),
			diff_sh_per: parseInt(lv * 0.008),
			limit_mp: lv * 800,
			desc: "生死印：攻击附加目标内力5%的额外伤害并回复等量气血\n逆守：受伤的30%转化为内力\n唯一：将你内力的130%转化为气血",
		},
		dodge: {
			ds: parseInt(lv * 2.5) + 100,
			ds_per: parseInt(lv / 100),
			mz_per: parseInt(lv / 100),
			desc: "闪避成功时进行幻影反击\n幻魔身法：绝对闪避，期间闪避可触发随机已装备技能",
		}
	};
};

// 生死印/死印+生印>=7时触发归元
var qihuan_guiyuan = function (me) {
	var si = me.query_temp("busiyinfa_siyin", 0);
	var sheng = me.query_temp("busiyinfa_shengyin", 0);
	if (si + sheng >= 7) {
		me.clear_downside(true);
		var hpHeal = Math.floor(me.max_hp * si * 0.03);
		var mpRecover = Math.floor(me.max_mp * sheng * 0.03);
		if (hpHeal > 0) me.do_recover(hpHeal);
		if (mpRecover > 0) me.add_mp(mpRecover);
		me.send_combat("<hio>归元！清除所有负面状态，回复" + hpHeal + "气血、" + mpRecover + "内力！</hio>\n");
		me.remove_temp("busiyinfa_siyin");
		me.remove_temp("busiyinfa_shengyin");
	}
};

// 检查生死锁链是否有效
var qihuan_link_valid = function (me) {
	var tid = me.query_temp("busiyinfa_qihuan_target");
	if (!tid) return false;
	if (!me.enemy || me.enemy.length === 0) {
		me.remove_temp("busiyinfa_qihuan_target");
		me.remove_temp("busiyinfa_siyin");
		me.remove_temp("busiyinfa_shengyin");
		return false;
	}
	for (var i = 0; i < me.enemy.length; i++) {
		if (me.enemy[i].id === tid && me.enemy[i].hp > 0) return true;
	}
	me.remove_temp("busiyinfa_qihuan_target");
	me.remove_temp("busiyinfa_siyin");
	me.remove_temp("busiyinfa_shengyin");
	return false;
};

// 幻魔身法：随机触发已装备攻击技能
var huanmo_trigger_pfm = function (me, target) {
	var cd = me.query_temp("busiyinfa_huanmo_trigger", 0);
	if (cd > 0) return;
	var pfms = [];
	for (var sk_id in me.skills) {
		var player_skill = me.skills[sk_id];
		var sp_skill_id = player_skill.enable_skill || sk_id;
		var sp_skill = SKILL.get(sp_skill_id);
		if (!sp_skill || !sp_skill.pfm) continue;
		for (var pfm_id in sp_skill.pfm) {
			var pfm = sp_skill.pfm[pfm_id];
			if (pfm.type === "force" || pfm.use_type === 2 || pfm.enable_skill === "force" || pfm.enable_skill === "dodge" || pfm.enable_skill === "parry") continue;
			if (pfm.query_distime(me, player_skill.level, player_skill.is_ref) <= 0) {
				pfms.push({ sk: sp_skill, pfm: pfm, id: sk_id, pid: pfm_id });
			}
		}
	}
	if (pfms.length > 0) {
		var chosen = pfms[Math.floor(Math.random() * pfms.length)];
		var lv = me.query_skill(chosen.id, 0);
		me.send_combat("<hio>$N如鬼魅般的身影触发了——" + chosen.pfm.name + "！</hio>\n", target);
		chosen.pfm.use(me, target, lv);
		chosen.pfm.change_distime(me, chosen.id + "/" + chosen.pid);
		me.set_temp("busiyinfa_huanmo_trigger", 1, 1500);
	}
};

// ---------------------------------------------------------------
// 轻功被动：闪避时幻影反击
// ---------------------------------------------------------------
this.on_dodge = function (me, from, par) {
	if (!from || from.hp <= 0 || !from.fight_type) return;

	var counterDmg = me.gj * 0.6;
	var result = from.damage(counterDmg, me, 0);
	if (result > 0) {
		me.send_combat("<him>$N身形一晃，幻影反手一击，造成" + Math.floor(result) + "点伤害。</him>\n", from);
	}

	// 幻魔身法状态下额外触发随机技能
	if (me.query_temp("busiyinfa_huanmo")) {
		huanmo_trigger_pfm(me, from);
	}
};

// ---------------------------------------------------------------
// 内功被动：逆守 + 内力为盾 + 生死锁链 + 幻魔身法绝对闪避
// ---------------------------------------------------------------
this.on_damage = function (me, from, sh) {
	if (sh <= 0) return sh;

	// 幻魔身法：绝对闪避
	if (me.query_temp("busiyinfa_huanmo")) {
		var counterDmg = me.gj * 0.6;
		var result = from ? from.damage(counterDmg, me, 0) : 0;
		if (result > 0 && from) {
			me.send_combat("<him>$N身形一晃，幻影反手一击，造成" + Math.floor(result) + "点伤害。</him>\n", from);
		}
		if (from && from.hp > 0) {
			huanmo_trigger_pfm(me, from);
		}
		return 0;
	}

	// 内力为盾：以MP抵消伤害
	if (me.query_temp("busiyinfa_nisheng")) {
		var availableMp = me.mp;
		if (availableMp >= sh) {
			me._nisheng_deducted = (me._nisheng_deducted || 0) + sh;
			me.add_mp(-sh);
			me.send_combat("<him>$N逆转经脉，以" + Math.floor(sh) + "点内力抵消了伤害！</him>\n");
			return 0;
		} else if (availableMp > 0) {
			me._nisheng_deducted = (me._nisheng_deducted || 0) + availableMp;
			me.add_mp(-availableMp);
			sh = sh - availableMp;
			me.send_combat("<him>$N内力枯竭，抵消" + availableMp + "点伤害，余伤由气血承担！</him>\n");
		}
	}

	if (sh <= 0) return sh;

	// 生死锁链：链接目标的伤害50%转化为内力
	if (qihuan_link_valid(me) && from && from.id === me.query_temp("busiyinfa_qihuan_target")) {
		var mpGain = Math.floor(sh * 0.5);
		if (mpGain > 0) {
			me.add_mp(mpGain);
			me.send_combat("<hio>$N的生死锁链将" + mpGain + "点伤害化为内力！</hio>\n");
		}
		me.add_temp("busiyinfa_shengyin", 1);
		qihuan_guiyuan(me);
	}

	// 逆守被动：受伤30%转化为内力
	var nishouMp = Math.floor(sh * 0.3);
	if (nishouMp > 0) {
		me.add_mp(nishouMp);
	}

	return sh;
};

this.on_force_over = function (me, target, par, sh) {
	if (sh <= 0 || !target || target.hp <= 0) return;

	// 生死印被动：附加目标内力上限5%额外伤害并回复等量气血
	var bonus = Math.floor(target.max_mp * 0.05);
	if (bonus > 0) {
		target.damage(bonus, me);
		me.add_hp(bonus);
		me.send_combat("<hir>生死印引爆，造成" + bonus + "点额外伤害并回复等量气血！</hir>\n", target);
	}

	// 生死锁链：对链接目标的伤害50%转化为气血
	if (qihuan_link_valid(me) && me.query_temp("busiyinfa_qihuan_target") === target.id) {
		var heal = Math.floor(sh * 0.5);
		if (heal > 0) {
			me.do_recover(heal);
			me.send_combat("<hio>$N的生死锁链将" + heal + "点伤害化为气血！</hio>\n");
		}
		me.add_temp("busiyinfa_siyin", 1);
		qihuan_guiyuan(me);
	}
};

// ---------------------------------------------------------------
// Pfm
// ---------------------------------------------------------------
this.pfm = {
	qihuan: {
		pid: "qihuan",
		name: "不死七幻",
		type: "force",
		enable_skill: "force",
		distime: 35000,
		allow_busy: false,
		query_mp: function (me, level) { return 1200; },
		query_desc: function (level) {
			return "对目标施加不可驱散的「幻身」（战斗结束消失）。链接期间，你对目标的伤害50%转化为气血，目标对你的伤害50%转化为内力。累积死印/生印合计7层时触发归元：清除所有负面状态并回复气血内力。";
		},
		use: function (me, target, lv) {
			if (!target) return false;
			if (!me.skills.force || me.skills.force.enable_skill !== "busiyinfa")
			return me.notify("不死七幻需要将不死印法装备为内功才可使用。");

			me.remove_temp("busiyinfa_qihuan_target");
			me.remove_temp("busiyinfa_siyin");
			me.remove_temp("busiyinfa_shengyin");

			target.add_status({
				id: "busiyinfa_huan",
				name: "幻身",
				desc: "被不死七幻锁定，生死二气流转不息。",
				duration: 86400000,
				downside: true,
				override: 2,
				no_clear: true,
				only_combat: true,
				prop: {},
				start_msg: "<hio>$N的生死二气锁定了$n，幻身降临！</hio>",
			}, me);

			me.set_temp("busiyinfa_qihuan_target", target.id);
			me.send_room("<hio>$N双手结印，眼中生死二气交替流转，一道无形的锁链将$N与$n的命运联结在一起！</hio>", target);
			return true;
		}
	},
	nisheng: {
		pid: "nisheng",
		name: "生死逆转",
		type: "force",
		enable_skill: "force",
		distime: 45000,
		allow_busy: true,
		query_mp: function (me, level) { return 500; },
		query_desc: function (level) {
			return "逆转经脉，8秒内受到的伤害改为扣除内力而非气血，攻击伤害降低40%。结束后回复被扣除的内力，并反噬对手等量内力。";
		},
		use: function (me, target, lv) {
			if (!me.skills.force || me.skills.force.enable_skill !== "busiyinfa")
			return me.notify("生死逆转需要将不死印法装备为内功才可使用。");

			me._nisheng_deducted = 0;
			me.add_status({
				id: "force",
				name: "逆转",
				duration: parseInt(lv * 10),
				desc: "受到的伤害由内力承担，攻击伤害降低40%",
				override: 2,
				prop: { gj_per: -(30 + parseInt(lv / 100)) },
				on_attach: function (p) {
					p.set_temp("busiyinfa_nisheng", 1);
				},
				on_expire: function (p) {
					p.remove_temp("busiyinfa_nisheng");
					var deducted = p._nisheng_deducted || 0;
					if (deducted > 0) {
						p.add_mp(deducted);
						p.send_combat("<him>逆转结束，回复" + Math.floor(deducted) + "点内力！</him>\n");
						if (p.enemy && p.enemy.length > 0) {
							var opp = p.enemy[0];
							if (opp && opp.hp > 0 && opp.max_mp > 0) {
								var drain = Math.min(deducted, opp.mp);
								opp.add_mp(-drain);
								p.send_combat("<him>" + opp.name + "被逆转之力反噬，损失" + Math.floor(drain) + "点内力！</him>\n", opp);
							}
						}
					}
				},
				start_msg: "<hio>$N逆转经脉，眼中生死二气爆闪！</hio>",
				finish_msg: "$N的逆转效果消散了。",
			});
			return true;
		}
	},
	huanmo: {
		pid: "huanmo",
		name: "幻魔身法",
		type: "dodge",
		enable_skill: "dodge",
		distime: 25000,
		allow_busy: false,
		query_mp: function (me, level) { return 600; },
		query_desc: function (level) {
			return "邪王独步天下的鬼魅身法。10秒内绝对闪避所有攻击，每次闪避触发幻影反击，并随机释放一个已装备的攻击技能（1.5秒内最多触发一次）。";
		},
		use: function (me, target, lv) {
			if (!me.skills.dodge || me.skills.dodge.enable_skill !== "busiyinfa")
			return me.notify("幻魔身法需要将不死印法装备为轻功才可使用。");

			me.remove_temp("busiyinfa_huanmo_trigger");
			me.add_status({
				id: "dodge",
				name: "幻魔身法",
				duration: parseInt(lv * 10),
				desc: "绝对闪避所有攻击，闪避反击并可触发随机技能",
				override: 2,
				prop: {},
				on_attach: function (p) {
					p.set_temp("busiyinfa_huanmo", 1);
				},
				on_expire: function (p) {
					p.remove_temp("busiyinfa_huanmo");
					p.remove_temp("busiyinfa_huanmo_trigger");
				},
				start_msg: "<him>$N的身影陡然虚化，化作数道幻影——「幻魔身法」！</him>",
				finish_msg: "$N的幻魔身法渐渐消散。",
			});
			return true;
		}
	}
};
