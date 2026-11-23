this.inherits(SKILL);
this.name = "空明拳";
this.id = "kongmingquan";
this.grade = 4;
this.attack_actions = [
	"$N空明拳看似轻描淡写，实则暗含大道至理，拳意绵绵如春蚕吐丝",
	"$N拳法空灵，虚虚实实，$n只觉眼前拳影重重，分不清哪一拳是真",
	"$N双手抱圆，空明拳意如浩渺星空般深邃，一招「空穴来风」袭向$n",
	"$N拳出无痕，空明拳的至柔之力化为至刚，直透$n的$l，如滴水穿石",
	"$N左拳虚晃如柳絮飘飞，右拳实击似蛟龙出海，空明拳的虚实之道让$n防不胜防",
	"$N拳如流水绵绵不绝，空明拳意笼罩$n四面八方，仿佛天地之间尽是拳影",
	"$N以空御实，借$n之力反制其身，空明拳之妙尽显无遗",
	"$N口中哼着不知名的小曲，手上空明拳却使得出神入化，浑然天成"
];
this.parry_actions = [
	"$n右拳虚引，左掌轻拨如抚琴弦，空明拳的柔劲将$N的攻击化于无形",
	"$n拳法空灵若虚，$N只觉自己的攻击如石沉大海，劲力消失得无影无踪",
	"$n以虚接实，空明拳意流转如太极圆转，将$N的招式引入空处",
	"$n双拳交错如行云流水，空明拳的借力打力之法让$N的攻击反噬自身",
	"$n如顽童嬉戏般随手化解，$N的凌厉攻势在空明拳前竟处处受制，毫无着力之处"
];
this.desc = "周伯通自创的拳法，以虚御实，空明灵动";
this.can_enables = ["unarmed"];
this.learn_condition = {
	max_mp: 4000,
	skill: { unarmed: 400 }
};

this.query_enable_prop = function (lv) {
	return {
		unarmed: {
			gj: parseInt(lv * 1.7) + 20,
			str: parseInt(lv * 167.0 / 1000),
			mz: parseInt(lv * 1.7) + 20,
		},
	}
}

this.pfm = {
	pfm1: {
		name: "乱拳",
		distime: 20000,
		enable_skill: "unarmed",
		release_time: 3096,
		mp: 30,
		use: function (me, target, lv) {
			me.send_room("<HIY>$N咧嘴一笑，突然拳速暴增——「乱拳」！左勾拳、右摆拳、上冲拳、下劈拳，毫无章法却又暗合天道！</HIY>", target);
			var allHit = true;
			for (var i = 0; i < 6; i++) {
				if (target.hp <= 0 || me.hp <= 0) break;
				var opts = { target: target, gj: me.gj, mz: me.mz };
				if (i === 5 && allHit) {
					// 按说明最后一拳无视对方 150 点防御（原先 diff_fy=150 被当成百分比，等于无视全部防御和免伤）。
					// 引擎没有「无视固定防御」的参数，这一拳期间给目标挂临时状态防御 -150，打完移除（不直接改写 fy，避免固化进 NPC 基础值）。
					target.with_temp_prop("luanquan_fy", { fy: -150 }, function () {
						if (!me.do_attack(opts)) allHit = false;
					});
				} else if (!me.do_attack(opts)) allHit = false;
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "瞬间对敌人攻击6拳，如果全部命中，最后一拳无视对方150防御。乱中有序，空明至理。";
		}
	},
	pfm2: {
		name: "左右互搏",
		distime: 30000,
		enable_skill: "unarmed",
		release_time: 3096,
		mp: 30,
		use: function (me, target, lv) {
			var lastPfmId = me.query_mem("sk/last_pfm_id");
			// 找到上一个绝招（pfm.js / auto_combat.js 释放成功时在内存里记录 sk/last_pfm_id / sk/last_pfm_lv，10 秒内有效（超时清空，再放新绝招则覆盖），不存档）
			var lastPfm = null;
			if (lastPfmId && lastPfmId !== "kongmingquan/pfm2" && !me._zuoyou_hubo) {
				var lp = String(lastPfmId).split("/");
				var lpSkill = SKILL.get(lp[0]);
				lastPfm = lpSkill && lpSkill.pfm ? lpSkill.pfm[lp[1]] : null;
				if (lastPfm && typeof lastPfm.use !== "function") lastPfm = null;
			}
			me.send_room("<HIY>$N双眼忽左忽右，左手画圆右手画方——「左右互搏」！一心二用，" + (lastPfm ? "左手空明拳右手却施展出之前的绝技" : "双手分别使出不同的招式") + "，威力虽减但奇招迭出！</HIY>", target);
			// 威力随等级成长：75% + 每100级+1%
			var per = 75 + Math.floor(lv / 100);
			if (lastPfm) {
				// 按说明：再次使用之前的绝招，效果为自身攻击的 per%——施展期间临时把攻击力按比例压低
				me._zuoyou_hubo = true; // 防重入（如上一招本身又去调用别的绝招）
				try {
					me.with_temp_prop("zuoyou_gj", { gj_per: per - 100 }, function () {
						me.send_room("<HIY>$N右手一翻，竟又使出了「" + lastPfm.name + "」！</HIY>", target);
						lastPfm.use(me, target, me.query_mem("sk/last_pfm_lv") || lv);
					});
				} finally {
					me._zuoyou_hubo = false;
				}
			} else {
				me.do_attack({
					target: target,
					gj: Math.floor(me.gj * per / 100),
					mz: me.mz,
				});
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			var per = 75 + Math.floor(lv / 100);
			return "再次使用你之前使用的绝招攻击敌人，效果是自身攻击的" + per + "%。一心二用，左右互搏。";
		}
	}
};
