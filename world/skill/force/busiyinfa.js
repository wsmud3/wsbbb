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
			desc: "闪避成功时进行幻影反击\n幻魔身法：绝对闪避，幻魔身法期间，闪避成功时，随机释放一个可使用的绝招",
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
		me.send_combat("<hio>$N周身生死二气交汇归元，浊气尽散，伤势与内力随之复苏！</hio>\n");
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
// 生死逆转：受到的伤害降低 30+等级/100 %，最高 60%（3000 级到顶）
var nisheng_dr = function (lv) { return Math.min(30 + parseInt((lv || 0) / 100), 60); };
var huanmo_duration = function (lv) { return Math.max(3000, Math.min(parseInt((lv || 0) * 10), 10000)); };
// 幻魔身法是否生效：以状态为准（状态不存档，下线即失效）
var huanmo_active = function (me) { return me.query_status && me.query_status("busiyinfa_huanmo") > 0; };

// 幻魔身法：闪避成功时，随机释放一个「可使用」的已装备攻击绝招（内置冷却 4 秒）。
// 「可使用」指满足正常施展条件（装备位、武器类型、暗器、忙乱、自身 check 等），与该绝招是否在冷却中无关；不消耗内力。
// 候选：所有已装备技能的绝招（任何部位），只排除幻魔身法本身；随机到不满足条件的（如武器不符）就重新随机。
// 绝招「本身」给自己或敌人挂了状态（增益/减益）时，该绝招冷却重新开始计算；
// 由被动（写在技能面板里的效果，以及装备、状态、真意）挂上的状态不算，按纯伤害处理，不影响冷却。
var HUANMO_TRIGGER_CD = 4000;
var HUANMO_WEAPON_SLOT = { sword: "sword", blade: "blade", staff: "staff", club: "club", whip: "whip" };
var huanmo_usable = function (me, slot, pfm, lv) {
	if (!pfm || typeof pfm.use !== "function") return false;
	if (pfm.use_type || pfm.no_auto) return false;
	if (pfm.enable_skill && pfm.enable_skill !== slot) return false;          // 必须是装备在这个位置上能用的绝招
	if (slot === "throwing" && !(me.can_throwing && me.can_throwing())) return false;
	var need = pfm.weapon_type || HUANMO_WEAPON_SLOT[pfm.enable_skill || slot];
	if (need && need !== me.query_weapon_type()
		&& !(WORLD.ZHENYI && WORLD.ZHENYI.weapon_free && WORLD.ZHENYI.weapon_free(me, need))) return false; // 华山真意「无剑·无招」                // 武器类型不对（如没装备鞭却出鞭法）
	if (me.is_busy && !pfm.allow_busy) return false;
	return true;
};
// 施展期间监视双方的 add_status：不在「被动上下文」里挂上的状态，才算绝招本身挂的。
// 被动 = 技能面板（启用属性）、装备、状态、真意等钩子，引擎执行它们时 CHARACTER.passive_depth > 0；
// 写在绝招代码里的效果（包括绝招传给 do_attack 的回调，如无形剑气命中后的昏迷）都算绝招本身。
var huanmo_cast_watch = function (me, target, fn) {
	var applied = false, saved = [];
	// 状态挂上了，或者调用后身上已有这个状态（如敌人已带幻身时再放不死七幻，刷新被拒但效果仍在）都算；
	// 挂不上又不存在（目标已死、免控等，如参合之殇的昏迷没打出来）不算
	var markAdd = function (orig) {
		return function (buff) {
			var own = !(CHARACTER.passive_depth > 0);
			var r = orig.apply(this, arguments);
			if (own && (r !== false || (buff && buff.id && this.query_status && this.query_status(buff.id) > 0))) applied = true;
			return r;
		};
	};
	[me, target].forEach(function (obj) {
		if (!obj || saved.some(function (sv) { return sv[0] === obj; })) return;
		saved.push([obj, Object.prototype.hasOwnProperty.call(obj, "add_status"), obj.add_status]);
		obj.add_status = markAdd(obj.add_status);
	});
	// 触发本身发生在闪避被动钩子里（passive_depth > 0），被触发的绝招是一次主动施展：
	// 施展期间把深度清零，绝招内部再调用的被动钩子会重新计深度。
	var depth = CHARACTER.passive_depth;
	CHARACTER.passive_depth = 0;
	try { fn(); }
	finally {
		CHARACTER.passive_depth = depth;
		for (var k = saved.length - 1; k >= 0; k--) {
			var sv = saved[k];
			if (sv[1]) sv[0].add_status = sv[2]; else delete sv[0].add_status;
		}
	}
	return applied;
};
var huanmo_restart_cd = function (me, slot, pid, pfm, lv) {
	var distime = pfm.query_distime(me, lv);
	if (WORLD.ZHENYI && WORLD.ZHENYI.pfm_cooldown) distime = WORLD.ZHENYI.pfm_cooldown(me, pfm, SKILL.get(me.skills[slot].enable_skill), distime);
	if (!(distime > 0)) return;
	if (me.is_player) {
		me.set_temp("pfm/" + slot + "/" + pid, 1, distime);
		me.notify('{type:"dispfm",id:"' + slot + "." + pid + '",rtime:0,distime:' + distime + '}');
	} else if (me.auto_skills) {
		for (var i = 0; i < me.auto_skills.length; i++) if (me.auto_skills[i].pfm === pfm) me.auto_skills[i].release_time = Date.now() + distime;
	}
};
var huanmo_trigger_pfm = function (me, target) {
	if (!target || target.hp <= 0) return;
	if (me.query_temp("busiyinfa_huanmo_trigger", 0) > 0) return;
	var pfms = [];
	for (var slot in me.skills) {
		var player_skill = me.skills[slot];
		if (!player_skill || !player_skill.enable_skill) continue;           // 只看已装备的位置（任何部位）
		var isBusi = player_skill.enable_skill === "busiyinfa";
		var sp_skill = SKILL.get(player_skill.enable_skill);
		if (!sp_skill || !sp_skill.pfm) continue;
		var lv = me.query_skill(sp_skill.id, 0);
		for (var pid in sp_skill.pfm) {
			var pfm = sp_skill.pfm[pid];
			if (isBusi && pid === "huanmo") continue;                          // 幻魔身法本身不会被幻魔身法触发
			if (huanmo_usable(me, slot, pfm, lv)) pfms.push({ pfm: pfm, pid: pid, slot: slot, lv: lv });
		}
	}
	// 随机顺序逐个尝试，第一个通过自身 check 的施展（check 可能有副作用，只对选中的调用）
	for (var n = pfms.length; n > 0; n--) {
		var k = Math.floor(Math.random() * n);
		var c = pfms[k]; pfms[k] = pfms[n - 1];
		if (c.pfm.check && !c.pfm.no_check && !c.pfm.check(me, c.lv)) continue;
		me.set_temp("busiyinfa_huanmo_trigger", 1, HUANMO_TRIGGER_CD);
		me.send_combat("<hio>$N如鬼魅般一闪，顺势使出「" + c.pfm.name + "」！</hio>\n", target);
		var applied = false;
		try { applied = huanmo_cast_watch(me, target, function () { c.pfm.use(me, target, c.lv, c.slot); }); }
		catch (e) { console.error("huanmo_trigger_pfm error:", (e && e.stack) || e); }
		if (applied) huanmo_restart_cd(me, c.slot, c.pid, c.pfm, c.lv);
		return;
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
// 内功被动：逆守（受伤 30% 化为内力）、生死印（附加伤害并回血）
// ---------------------------------------------------------------
this.on_damage = function (me, from, sh, ctx) {
	var isReflect = ctx && ctx.kind === "reflect"; // 反震/反伤来的伤害：照常化解，但不再反击
	if (sh <= 0) return sh;

	// 幻魔身法的绝对闪避改在闪避判定里实现（见绝招 huanmo：持续期间闪避 +999999，与凌波微步相同），
	// 这里不再按「内功位受伤后清零」处理——那种写法只在内功也装不死印法时生效，且判定上仍算被打中。
	if (me.query_temp("busiyinfa_huanmo")) me.remove_temp("busiyinfa_huanmo"); // 清理旧版写入存档、不过期的标记

	// 生死逆转的内力挡伤、不死七幻的生死锁链都是绝招自身效果，写在它们挂的状态上（见 pfm），融入自创武学后照常生效。

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
		var dealt = target.damage(bonus, me);
		me.add_hp(bonus);
		if (dealt > 0) me.send_combat("<hir>生死印轰然引爆，对$n造成" + dealt + "点伤害，$N的伤势随之平复几分！</hir>\n", target);
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
		mp: 1933,
		query_desc: function (me, lv) {
			return "对目标施加不可驱散的「幻身」（战斗结束消失）。链接期间，你对目标的伤害50%转化为气血，目标对你的伤害50%转化为内力。累积死印/生印合计7层时触发归元：清除所有负面状态并回复气血内力。";
		},
		use: function (me, target, lv) {
			if (!target) return false;

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
			// 生死锁链：链接期间对目标的伤害 50% 化为气血、目标对你的伤害 50% 化为内力，各记死印 / 生印，合计 7 层归元。
			// 写在自身的「生死锁链」状态上，融入自创武学后照常生效。
			me.add_status({
				id: "busiyinfa_lian", name: "生死锁链", desc: "与幻身之敌生死相连：伤敌化为气血，受伤化为内力",
				duration: 86400000, override: 2, no_clear: true, only_combat: true,
				on_force_over: function (owner, t, par, sh) {
					if (!(sh > 0) || !t || !qihuan_link_valid(owner) || owner.query_temp("busiyinfa_qihuan_target") !== t.id) return;
					var heal = Math.floor(sh * 0.5);
					if (heal > 0) {
						owner.do_recover(heal);
						owner.send_combat("<hio>生死锁链流转，$N的伤势随之平复几分。</hio>\n");
					}
					owner.add_temp("busiyinfa_siyin", 1);
					qihuan_guiyuan(owner);
				},
				on_damage: function (owner, from, sh) {
					if (sh > 0 && from && qihuan_link_valid(owner) && from.id === owner.query_temp("busiyinfa_qihuan_target")) {
						var mpGain = Math.floor(sh * 0.5);
						if (mpGain > 0) {
							owner.add_mp(mpGain);
							owner.send_combat("<hio>生死锁链流转，$N将来袭的劲力化作了内力。</hio>\n");
						}
						owner.add_temp("busiyinfa_shengyin", 1);
						qihuan_guiyuan(owner);
					}
					return sh;
				}
			});
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
		mp: 2020,
		query_desc: function (me, lv) {
			lv = lv || 0;
			return "逆转经脉，" + (Math.min(parseInt(lv * 10), 30000) / 1000) + "秒内受到的伤害降低" + nisheng_dr(lv) + "%，且改为扣除内力而非气血。结束后回复被扣除的内力，并反噬对手等量内力。";
		},
		use: function (me, target, lv) {
			me._nisheng_deducted = 0;
			me.add_status({
				id: "force",
				name: "逆转",
				duration: Math.min(parseInt(lv * 10), 30000),
				desc: "受到的伤害降低" + nisheng_dr(lv) + "%，并由内力承担",
				override: 2,
				prop: { diff_sh_per2: nisheng_dr(lv) },   // 免伤 buff 走特殊免伤，在软上限之后叠加
				// 受到的伤害由内力承担：写在状态上（原在不死印法的内功受伤钩子里），融入自创武学后照常生效
				on_damage: function (p, from, sh) {
					if (!(sh > 0)) return sh;
					var availableMp = p.mp;
					if (availableMp >= sh) {
						p._nisheng_deducted = (p._nisheng_deducted || 0) + sh;
						p.add_mp(-sh);
						p.send_combat("<him>$N逆转经脉，以内力硬接下这一击！</him>\n");
						return 0;
					} else if (availableMp > 0) {
						p._nisheng_deducted = (p._nisheng_deducted || 0) + availableMp;
						p.add_mp(-availableMp);
						p.send_combat("<him>$N内力已竭，余劲透体而入！</him>\n");
						return sh - availableMp;
					}
					return sh;
				},
				on_expire: function (p) {
					p.remove_temp("busiyinfa_nisheng");   // 清理旧版标记
					var deducted = p._nisheng_deducted || 0;
					if (deducted > 0) {
						p.add_mp(deducted);
						p.send_combat("<him>$N经脉复归原位，内力缓缓回涌。</him>\n");
						if (p.enemy && p.enemy.length > 0) {
							var opp = p.enemy[0];
							if (opp && opp.hp > 0 && opp.max_mp > 0) {
								var drain = Math.min(deducted, opp.mp);
								opp.add_mp(-drain);
								p.send_combat("<him>逆转之力反噬而去，$n内息一阵紊乱！</him>\n", opp);
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
		mp: 1847,
		query_desc: function (me, lv) {
			lv = lv || 0;
			return "邪王独步天下的鬼魅身法。" + (huanmo_duration(lv) / 1000) + "秒内绝对闪避所有攻击。";
		},
		// 幻影反击、幻魔期间闪避随机释放绝招都是不死印法装备为轻功时的面板被动（见 query_enable_prop / on_dodge_success），
		// 不属于本绝招；融入自创武学只得绝对闪避（有意为之：避免借高频幻魔放大自创武学融合的绝招池）。
		use: function (me, target, lv) {
			me.remove_temp("busiyinfa_huanmo_trigger");
			me.remove_temp("busiyinfa_huanmo");
			// 与凌波微步相同：持续期间闪避 +999999，走正常闪避判定（闪避成功才触发幻影反击与随机技能）
			me.add_status({
				id: "busiyinfa_huanmo",
				name: "幻魔",
				duration: huanmo_duration(lv),
				desc: "绝对闪避所有攻击",
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
