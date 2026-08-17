this.inherits(SKILL);
this.name = "乾坤大挪移";
this.id = "qiankundanuoyi";
this.grade = 5;
this.is_public = true;
this.attack_actions = [
	"$N运转乾坤大挪移心法，牵引挪移，一掌向$n的$l拍去",
	"$N使出乾坤大挪移，借力打力，挪移$n的攻势反击向$n的$l",
	"$N身形一转，乾坤大挪移颠倒阴阳，一掌带着挪移之力击向$n"
];
this.parry_actions = [
	"$n施展乾坤大挪移，牵引$N的攻击偏向一旁",
	"$n运转乾坤大挪移心法，将$N的力道尽数挪移",
	"$n双手一引，乾坤大挪移颠倒劲力，将$N的攻击化为无形"
];
this.desc = "明教无上心法，可牵引挪移敌方攻击，积攒乾坤之力反击敌人。乾坤者，天地之定位也，挪移者，阴阳之变化也。";
this.can_enables = ["parry"];
this.learn_condition = {
	max_mp: 10000,
	skill: { parry: 1000 }
};

var _this = this;

// Helper: read current stack count from active status
_this._getStacks = function (me) {
	if (me && me.status) {
		for (var si = 0; si < me.status.length; si++) {
			if (me.status[si].id === "qkdny_stack") {
				return me.status[si].count;
			}
		}
	}
	return 0;
};
// Helper: compute max stacks based on skill level
_this._getMaxStacks = function (me) {
	var lv = me.query_skill("qiankundanuoyi", 0);
	return 12 + Math.floor(lv / 300);
};

this.on_parry_over = function (me, target, par) {
	if (!target || target.hp <= 0) return;
	var maxStacks = _this._getMaxStacks(me);
	var stacks = _this._getStacks(me);
	if (stacks >= maxStacks) return;
	var lv = me.query_skill("qiankundanuoyi", 0);
	var addStacks = par.is_parry ? 2 : 1;
	stacks = Math.min(stacks + addStacks, maxStacks);
	me.set_temp("qkdny_stacks", stacks);
	var fy_per_stack = lv;  // 每层防御 = 技能等级
	me.add_status({
		id: "qkdny_stack",
		name: "乾坤",
		desc: "每层+" + fy_per_stack + "防御，上限" + maxStacks + "层",
		duration: parseInt(lv * 10),  // 5秒，每次积攒刷新
		downside: false,
		override: 1,
		max_count: maxStacks,
		only_combat: false,
		prop: { fy: fy_per_stack },
	});
};

this.query_enable_prop = function (lv) {
	return {
		parry: {
			zj: parseInt(lv * 2700 / 1000),
			fy: parseInt(lv * 1600 / 1000),
			hp_per: 5,
			fy_per: 5,
			desc: "招架成功积攒2层，失败积攒1层(最多" + (12 + Math.floor(lv / 300)) + "层)，每层+" + lv + "防御(5秒) | 大挪移：消耗全部乾坤之力反击 | 倒转乾坤：消耗全部乾坤之力恢复气血转移负面状态",
		},
	};
}
this.pfm = {
	danuoyi: {
		name: "大挪移",
		distime: 15000,
		enable_skill: "parry",
		release_time: 3800,
		mp: 35,
		use: function (me, target, lv) {
			var stacks = _this._getStacks(me);
			if (stacks <= 0)
			return me.notify("你还没有积攒乾坤之力，无法施展大挪移。");
			me.send_room("<him>$N运转乾坤大挪移，积攒的" + stacks + "层乾坤之力猛然爆发！</him>", target);
			var bonus_gj = Math.floor(stacks / 2) * me.gj;
			me.do_attack({
				target: target,
				gj: me.gj + bonus_gj,
				attack_msg: "<him>$N以乾坤大挪移之力反击$n！</him>"
			});
			me.end_attack(target);
			me.remove_temp("qkdny_stacks");
			me.remove_status("qkdny_stack", true);  // 消耗全部层数
		},
		query_desc: function (me, lv) {
			var stacks = _this._getStacks(me);
			return "消耗全部乾坤之力（当前" + stacks + "层），反击敌人造成(层数/2×攻击力)的额外伤害。";
		}
	},
	daozhuan: {
		name: "倒转乾坤",
		distime: 20000,
		enable_skill: "parry",
		release_time: 3800,
		allow_busy: true,
		mp: 35,
		use: function (me, target, lv) {
			var stacks = _this._getStacks(me);
			if (stacks <= 0)
			return me.notify("你还没有积攒乾坤之力，无法施展倒转乾坤。");
			me.send_room("<him>$N逆转乾坤大挪移心法——「倒转乾坤」！</him>", target);
			// 每层恢复4%最大气血
			var heal = Math.floor(me.max_hp * 0.04 * stacks);
			if (heal > 0) {
				me.do_recover(heal);
				me.send_room("<him>$N消耗" + stacks + "层乾坤之力，恢复了" + heal + "点气血！</him>");
			}
			// 转移一个负面状态给目标
			if (target && target.hp > 0 && me.status && me.status.length > 0) {
				for (var i = me.status.length - 1; i >= 0; i--) {
					var st = me.status[i];
					if (st.downside && !st.no_diff && st.id !== "qkdny_stack") {
						me.remove_status(st.id, true);
						target.add_status({
							id: st.id + "_transfer",
							name: st.name,
							desc: st.desc + "(转移)",
							duration: st.duration || 10000,
							downside: true,
							prop: st.prop,
						}, me);
						me.send_room("<him>$N以倒转乾坤之力将" + st.name + "<him>转移到了$n身上！</him>", target);
						break;
					}
				}
			}
			me.remove_temp("qkdny_stacks");
			me.remove_status("qkdny_stack", true);  // 消耗全部层数
		},
		query_desc: function (me, lv) {
			var stacks = _this._getStacks(me);
			return "消耗全部乾坤之力（当前" + stacks + "层），每层恢复4%气血，并将一个负面状态转移给敌人。可在忙碌中使用。";
		}
	}
};
