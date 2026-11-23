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


this.query_enable_prop = function (lv) {
	return {
		force: {
			gj: lv * 2 + 100,
			add_sh_per: 8,
			diff_busy: 4,
			limit_mp: lv * 286,
			desc: "当你命中敌人会造成" + taixuan_extra(lv) + "内功伤害，不可招架\n唯一：将你内力的80%转化为气血",
		},
	}
}
// 太玄附加伤害：每级 4 点（1000 级 4000）；白首太玄期间加倍
function taixuan_extra(lv) { return lv * 4; }
// 命中（未被闪避）就附加内功伤害；招架挡不住这部分
this.on_force_over = function (me, target, par, sh) {
	if (!target || target === me || target.hp <= 0 || (par && par.is_dodge)) return;
	var lv = me.query_skill("taixuangong", 0);
	var extra = taixuan_extra(lv);
	var st = me.status && me.status.find(function (x) { return x.taixuan_double; });
	if (st) extra *= 2;
	if (!(extra > 0)) return;
	var dealt = target.damage(extra, me);
	if (dealt > 0) me.send_combat("<HIW>太玄内劲透体而入，" + target.name + "受到了" + dealt + "点内功伤害！</HIW>\n", target);
};

this.pfm = {
	shibu: {
		name: "十步杀一人",
		distime: 30000,
		allow_busy: true, // 说明：无视忙乱
		enable_skill: "force",
		release_time: 4000,
		mp: 18,
		use: function (me, target, lv) {
			me.send_room("<HIW>$N长啸一声，太玄功运转——「十步杀一人」！</HIW>", target);
			// 按说明：每名敌人先攻击一次，命中则再追加一次，直到落空（每名敌人最多 10 次，取「十步」之意，防止无限连击）。
			var SHIBU_MAX = 10;
			var list = (me.enemy && me.enemy.length) ? me.enemy.slice() : (target ? [target] : []);
			for (var i = 0; i < list.length; i++) {
				var t = list[i];
				for (var n = 0; n < SHIBU_MAX && t && t.hp > 0 && me.hp > 0; n++) {
					var sh = me.do_attack({
						target: t,
						gj: me.gj * 1.5,
						diff_fy: 40,
						attack_msg: n === 0 ? "<HIW>$N的太玄剑气向" + t.name + "袭去！</HIW>" : "<HIW>$N剑气不绝，又是一剑！</HIW>"
					});
					if (!(sh > 0)) break;
				}
			}
			if (target) me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "对附近敌人进行快速攻击，突破对方40%防御，如果命中增加攻击次数（每名敌人最多10次），无视忙乱";
		}
	},
	baishou: {
		name: "白首太玄",
		distime: 45000,
		enable_skill: "force",
		release_time: 4000,
		mp: 18,
		use: function (me, target, lv) {
			me.send_room("<HIG>$N将太玄功力运转周身——「白首太玄」！</HIG>");
			me.add_status({
				id: "force",
				name: "白首太玄",
				desc: "太玄功附加伤害加倍，命中后恢复攻击力40%气血",
				duration: 3000 + parseInt(lv * 10),
				downside: false,
				override: 2,
				taixuan_double: true,   // 太玄功的命中附加伤害（on_force_over）看到这个标记就加倍
				start_msg: "<HIG>$N白首太玄，功力倍增！</HIG>",
				finish_msg: "$N的白首太玄效果消失了。",
				// 命中后恢复攻击力 40% 气血：写在状态上（原在太玄功的 on_force_over），融入自创武学后照常生效
				on_force_over: function (owner, target, par, sh) {
					if (sh > 0) { var heal = Math.floor(owner.gj * 0.4); if (heal > 0) owner.do_recover(heal); }
				},
			});
		},
		query_desc: function (me, lv) {
			return "将太玄功力运转周身，" + (3 + parseInt(lv * 10 / 1000)) + "秒内太玄功附加伤害加倍，命中后恢复自己攻击力40%的气血";
		}
	}
};
