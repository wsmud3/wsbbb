this.inherits(SKILL);
this.name = "参合指";
this.id = "canhezhi";
this.grade = 4;
this.desc = "参合指";
this.can_enables = ["unarmed"];
this.attack_actions = [
	"$N食指轻弹，参合指的指力破空而至，如一道无形剑气点向$n的$l",
	"$N手指连弹，数道指风嗤嗤作响，$n只觉穴道一麻，劲力已透体而入",
	"$N中指微曲如满弓，参合指力如毒蛇吐信，倏地点向$n要害之处",
	"$N十指齐张，参合指力化作十道劲风破空而出，从不同方位射向$n",
	"$N运起参合指心法，指力无声无息却凌厉无比，空气中隐隐有气劲扭曲",
	"$N参合指力一指点出，空间仿佛凝固，$n只觉全身穴道皆被凌厉指力锁定",
	"$N指风变幻莫测，参合指忽快忽慢忽轻忽重，令$n捉摸不定无从防御",
	"$N双手食指齐出，参合指力交织成十字气劲，封住$n进退之路"
];
this.parry_actions = [
	"$n食指轻弹，参合指力后发先至，如利箭般将$N的攻势点在半途",
	"$n运起参合指心法，指风如无形利刃射出，$N的攻击被强行打断",
	"$n五指连弹如琵琶轮指，参合指力如天罗地网般将$N的招式阻住",
	"$n以参合指点向$N来招的关节要处，$N不得不收招回防",
	"$n指尖凝聚参合之力，轻轻一点便让$N的攻势土崩瓦解，如冰雪消融"
];
this.learn_condition = {
	max_mp: 4000,
	skill: { unarmed: 400 }
};
this.query_enable_prop = function (lv) {
	return {
		unarmed: {
			gj: parseInt(lv * 1.5) + 20,
			mz: parseInt(lv * 1.5) + 20,
			bj_per: 4,
			int: parseInt(lv * 169.0 / 1000),
			desc: "命中后叠加参合状态，每层增加参合之殇30%伤害",
		}
	};
}

// 被动：命中时叠加参合层数
this.on_attack_over = function (me, target, par, sh) {
	if (!par.is_dodge && !par.is_parry && sh > 0) {
		target.add_status({
			id: "canhe",
			name: "参合",
			desc: "参合指力层层叠加，每层增加参合之殇30%伤害",
			duration: 10000 + parseInt(lv * 5),
			override: 1,
			max_count: 10,
			downside: true,
		});
	}
}

this.pfm = {
	pfm1: {
		name: "参合之殇",
		distime: 20000,
		enable_skill: "unarmed",
		release_time: 3096,
		mp: 30,
		use: function (me, target, lv) {
			// 读取目标已有的参合层数
			var stacks = 0;
			if (target.status) {
				for (var j = 0; j < target.status.length; j++) {
					if (target.status[j].id === "canhe") stacks = target.status[j].count || 0;
				}
			}
			// 每层增加30%伤害
			var gj = Math.floor(me.gj * (100 + stacks * 30) / 100);
			me.send_room("<HIY>$N双眸精光一闪——「参合之殇」！参合指力蓄势而发，当前已积" + stacks + "层参合之力，一指点出天地色变！</HIY>", target);
			if (me.do_attack({
				target: target,
				gj: gj,
				mz: me.mz,
			})) {
				// 大于4层则昏迷5秒，并重置层数
				if (stacks >= 5) {
					target.remove_status("canhe");
					target.add_status({
						id: "faint",
						name: "昏迷",
						desc: "参合之力爆发，昏迷不醒",
						is_faint: true,
						duration: Math.min(parseInt(lv * 5), 5000),
						downside: true,
					});
					me.send_room("<HIR>$n周身参合指力轰然爆发，被震得昏迷过去！</HIR>", target);
				}
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "对敌人造成伤害，每层参合状态增加你30%伤害，如果对方层数大于4层将昏迷" + (Math.min(parseInt(lv * 5), 5000) / 1000) + "秒。参合之殇，积重难返。";
		}
	}
};
