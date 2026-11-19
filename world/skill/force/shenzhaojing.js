this.inherits(SKILL);
this.name = "神照经";
this.id = "shenzhaojing";
this.grade = 4;
this.force_rad = 0.8;
this.desc = "连城诀中至高无上的内功心法，可起死回生";
this.can_enables = ["force", "unarmed"];
this.learn_condition = {
		max_mp: 4000,
		skill: { force: 400 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				str: parseInt(lv * 176.0 / 1000),
				con: parseInt(lv * 176.0 / 1000),
				dex: parseInt(lv * 176.0 / 1000),
				int: parseInt(lv * 176.0 / 1000),
				limit_mp: lv * 150,
				desc: "唯一：将你内力的80%转化为气血",
			},
			unarmed: {
				gj: parseInt(lv * 1.7) + 0,
				mz: parseInt(lv * 1.7) + 0,
				str: parseInt(lv * 210.0 / 1000),
				con: parseInt(lv * 210.0 / 1000),
			},
		}
	}

// ===== 拳经盾期间拳经冷却 2 倍速流逝 =====
// 冷却存在两处：玩家手动出招的 temp "pfm/force/pfm2"（{v,e}）与自动出招 auto_skills 项的 release_time（绝对时间）。
var QJ_KEY = "pfm/force/pfm2";
function quanjing_cd_left(me, pfm) {
	var now = Date.now(), left = 0;
	var t = me.temp && me.temp[QJ_KEY];
	if (t && t.e > now) left = t.e - now;
	if (me.auto_skills) for (var i = 0; i < me.auto_skills.length; i++) {
		var it = me.auto_skills[i];
		if (it.pfm === pfm && it.release_time > now) left = Math.max(left, it.release_time - now);
	}
	return left;
}
function quanjing_cd_shift(me, pfm, delta) {
	if (!delta) return;
	var now = Date.now();
	var t = me.temp && me.temp[QJ_KEY];
	if (t && t.e > now) t.e = Math.max(now + 1, t.e + delta);
	if (me.auto_skills) for (var i = 0; i < me.auto_skills.length; i++) {
		var it = me.auto_skills[i];
		if (it.pfm === pfm && it.release_time > now) it.release_time = Math.max(now + 1, it.release_time + delta);
	}
	if (me.is_player) me.notify('{type:"changepfm",id:"force/pfm2",time:' + Math.round(delta) + '}');
}
// 护盾挂上（且本次冷却已写入）后：按护盾持续满 D 毫秒预估剩余冷却
function quanjing_cd_on_shield(me, pfm, st) {
	if (!me || !me.status || me.status.indexOf(st) < 0) return;
	var R = quanjing_cd_left(me, pfm);
	if (!(R > 0)) return;
	var D = st.duration;
	var want = R <= 2 * D ? R / 2 : R - D;
	st.qj_t0 = Date.now(); st.qj_R = R; st.qj_pfm = pfm;
	quanjing_cd_shift(me, pfm, want - R);
}
// 护盾结束（提前破掉或到时）：护盾实际在场 x 毫秒，冷却应剩 max(0, R - 2x)
function quanjing_cd_on_expire(me, st) {
	if (!st.qj_t0 || !st.qj_pfm) return;
	var x = Date.now() - st.qj_t0;
	var cur = quanjing_cd_left(me, st.qj_pfm);
	if (!(cur > 0)) return;
	quanjing_cd_shift(me, st.qj_pfm, Math.max(0, st.qj_R - 2 * x) - cur);
}

this.pfm = {
		pfm1: {
			name: "神照",
			distime: 60000,
			enable_skill: "force",
			mp: 30,
			use: function (me, target, lv) {
				var bonus = Math.floor(lv * 210 / 1000);
				me.send_room("<HIY>$N盘膝而坐，神照经内力如江河奔涌——「神照」！一道璀璨金光自九天照落，$N筋骨愈发强韧，神力贯体！</HIY>", me);
				me.add_status({
					id: "shenzhao",
					name: "神照",
					desc: "根骨、臂力、身法增加" + bonus + "点",
					duration: 20000 + parseInt(lv * 10),
					prop: { str: bonus, con: bonus, dex: bonus },
				})},
			query_desc: function (me, lv) {
				return "神照——在" + (20 + parseInt(lv * 10 / 1000)) + "秒内增加你" + (Math.floor(lv * 210 / 1000)) + "点根骨、臂力、身法。";
			}
		},
		pfm2: {
			name: "拳经",
			distime: 10000,
			enable_skill: "force",
			mp: 30,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N沉腰坐马，右拳紧握——「拳经」！神照经内力如江河般涌入手臂，一拳击出带着至刚至猛的浩然正气轰向$n！</HIY>", target);
				if (me.do_attack({
					target: target,
					gj: Math.floor(me.gj * (6 + Math.floor(me.query_prop("str") / 100)) / 100),
					mz: me.mz,
				})) {
					// 护盾：shield 为剩余吸收量，由 CHARACTER.damage 消耗（耗尽即移除）。重复命中时刷新护盾
					me.remove_status("quanjing", true);
					var qj = {
						id: "quanjing",
						name: "拳经盾",
						desc: "吸收1392点伤害，期间拳经冷却加快",
						duration: 5000 + parseInt(lv * 10),
						shield: 1392,
						// 护盾提前破掉/结束：把冷却校正为「护盾在场期间 2 倍速流逝，其余正常」
						on_expire: function (p) { quanjing_cd_on_expire(p, this); },
					};
					me.add_status(qj);
					// 本次拳经的冷却是在 use 返回后才由 pfm.js / auto_combat.js 写入的，推迟到写入之后再调整
					var self = this;
					setTimeout(function () { quanjing_cd_on_shield(me, self, qj); }, 0);
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "拳经——一式直拳对敌人造成伤害，造成6%攻击力的伤害，你臂力越高造成的伤害越大，命中后给自己增加一个吸收1392伤害的护盾，护盾存在期间拳经冷却速度加快100%。";
			}
		}
	};
