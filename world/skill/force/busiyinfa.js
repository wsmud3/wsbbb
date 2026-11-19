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

// 幻魔身法时长：同凌波微步，lv×10 毫秒，最短 3 秒、最长 10 秒
var huanmo_duration = function (lv) { return Math.max(3000, Math.min(parseInt((lv || 0) * 10), 10000)); };
// 幻魔身法是否生效：以状态为准（状态不存档，下线即失效）
var huanmo_active = function (me) { return me.query_status && me.query_status("busiyinfa_huanmo") > 0; };

// 幻魔身法：随机触发已装备攻击技能
var huanmo_trigger_pfm = function (me, target) {
	var cd = me.query_temp("busiyinfa_huanmo_trigger", 0);
	if (cd > 0) return;
	// 候选：已装备在武器/拳脚等攻击位上的特殊技能的绝招（内功、轻功、招架位除外）。
	// 原先只收「冷却时长 <= 0」的绝招（query_distime 返回的是冷却总长，不是剩余冷却），攻击绝招几乎都有冷却，所以从不触发；
	// 触发后又调用 change_distime 把该绝招的冷却清零，与说明不符。现改为：随机挑一个已装备的攻击绝招免费施展一次，不影响它自己的冷却。
	var pfms = [];
	for (var slot in me.skills) {
		var player_skill = me.skills[slot];
		if (!player_skill || !player_skill.enable_skill) continue;           // 只看已装备的位置
		if (slot === "force" || slot === "dodge" || slot === "parry") continue;
		var sp_skill = SKILL.get(player_skill.enable_skill);
		if (!sp_skill || !sp_skill.pfm) continue;
		for (var pfm_id in sp_skill.pfm) {
			var pfm = sp_skill.pfm[pfm_id];
			if (!pfm || typeof pfm.use !== "function") continue;
			if (pfm.type === "force" || pfm.use_type === 2 || pfm.no_auto) continue;
			if (pfm.enable_skill && pfm.enable_skill !== slot) continue;
			pfms.push({ sk: sp_skill, pfm: pfm, id: sp_skill.id, pid: pfm_id });
		}
	}
	if (pfms.length > 0) {
		var chosen = pfms[Math.floor(Math.random() * pfms.length)];
		var lv = me.query_skill(chosen.id, 0);
		me.set_temp("busiyinfa_huanmo_trigger", 1, 1500);
		me.send_combat("<hio>$N如鬼魅般的身影触发了——" + chosen.pfm.name + "！</hio>\n", target);
		try { chosen.pfm.use(me, target, lv); }
		catch (e) { console.error("huanmo_trigger_pfm error:", (e && e.stack) || e); }
	}
};

// ---------------------------------------------------------------
// 轻功被动：闪避成功时幻影反击
// 原先写在 on_dodge 里，而引擎只在「没闪开」时调用 on_dodge，变成了被打中才反击；
// 再叠加内功位 on_damage 的幻魔反击，内功、轻功同装时一击会触发两套。
// 现改为 on_dodge_success（真正闪开时才调用）：一击要么闪开（这里反击），要么没闪开
// （幻魔期间由内功位 on_damage 化解并反击），不会重复。
// ---------------------------------------------------------------
this.on_dodge_success = function (me, from, par) {
	if (!from || from.hp <= 0 || !from.fight_type) return;

	var counterDmg = me.gj * 0.6;
	var result = from.damage(counterDmg, me, 0, { kind: "reflect" });
	if (result > 0) {
		me.send_combat("<him>$N身形一晃，幻影反手一击，造成" + Math.floor(result) + "点伤害。</him>\n", from);
	} else {
		me.send_combat("<him>$N身形一晃，幻影反手一击，却被$n护体真气化解。</him>\n", from);
	}

	// 幻魔身法状态下额外触发随机技能
	if (huanmo_active(me)) {
		huanmo_trigger_pfm(me, from);
	}
};

// ---------------------------------------------------------------
// 内功被动：逆守 + 内力为盾 + 生死锁链 + 幻魔身法绝对闪避
// ---------------------------------------------------------------
this.on_damage = function (me, from, sh, ctx) {
	var isReflect = ctx && ctx.kind === "reflect"; // 反震/反伤来的伤害：照常化解，但不再反击
	if (sh <= 0) return sh;

	// 幻魔身法的绝对闪避改在闪避判定里实现（见绝招 huanmo：持续期间闪避 +999999，与凌波微步相同），
	// 这里不再按「内功位受伤后清零」处理——那种写法只在内功也装不死印法时生效，且判定上仍算被打中。
	if (me.query_temp("busiyinfa_huanmo")) me.remove_temp("busiyinfa_huanmo"); // 清理旧版写入存档、不过期的标记

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
		query_desc: function (me, lv) {
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
				// 不受负面抵抗影响：目标负面抵抗 ≥100% 时（多数首领）会被直接拒绝挂上，图标不显示，而锁链效果照常
				no_diff: true,
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
		query_desc: function (me, lv) {
			lv = lv || 0;
			return "逆转经脉，" + (Math.min(parseInt(lv * 10), 30000) / 1000) + "秒内受到的伤害改为扣除内力而非气血，攻击伤害降低" + (30 + parseInt(lv / 100)) + "%。结束后回复被扣除的内力，并反噬对手等量内力。";
		},
		use: function (me, target, lv) {
			if (!me.skills.force || me.skills.force.enable_skill !== "busiyinfa")
			return me.notify("生死逆转需要将不死印法装备为内功才可使用。");

			me._nisheng_deducted = 0;
			me.add_status({
				id: "force",
				name: "逆转",
				duration: Math.min(parseInt(lv * 10), 30000),
				desc: "受到的伤害由内力承担，攻击伤害降低" + (30 + parseInt(lv / 100)) + "%",
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
		query_desc: function (me, lv) {
			lv = lv || 0;
			return "邪王独步天下的鬼魅身法。" + (huanmo_duration(lv) / 1000) + "秒内绝对闪避所有攻击，每次闪避触发幻影反击，并随机释放一个已装备的攻击技能（1.5秒内最多触发一次）。";
		},
		use: function (me, target, lv) {
			if (!me.skills.dodge || me.skills.dodge.enable_skill !== "busiyinfa")
			return me.notify("幻魔身法需要将不死印法装备为轻功才可使用。");

			me.remove_temp("busiyinfa_huanmo_trigger");
			me.remove_temp("busiyinfa_huanmo");
			// 与凌波微步相同：持续期间闪避 +999999，走正常闪避判定（闪避成功才触发幻影反击与随机技能）
			me.add_status({
				id: "busiyinfa_huanmo",
				name: "幻魔身法",
				duration: huanmo_duration(lv),
				desc: "绝对闪避所有攻击，闪避反击并可触发随机技能",
				override: 2,
				prop: { ds: 999999 },
				on_expire: function (p) {
					p.remove_temp("busiyinfa_huanmo_trigger");
				},
				start_msg: "<him>$N的身影陡然虚化，化作数道幻影——「幻魔身法」！</him>",
				finish_msg: "$N的幻魔身法渐渐消散。",
			});
			return true;
		}
	}
};
