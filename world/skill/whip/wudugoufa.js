this.inherits(SKILL);
this.name = "五毒钩法";
this.id = "wudugoufa";
this.grade = 3;
this.attack_actions = [
	"$N钩法诡异莫测，五毒钩带着一股腥风，钩向$n",
	"$N手中毒钩连挥，招招不离$n要害，狠辣无比",
	"$N身形一矮，$w从下盘反钩而上，钩尖闪烁着幽绿毒光，直取$n小腹",
	"$N狞笑一声，$w破空而至，带着刺鼻的腥臭气息——钩尖上淬的蝎毒、蛇毒、蜈蚣毒、蟾酥、壁虎毒同时发作！",
	"$N手腕连翻，$w化作五道绿色钩影，如五条毒虫同时噬向$n的$l",
	"$N步法诡异，绕至$n身侧，$w闪电般钩出，攻向$n视线不及的死角",
	"$N手中$w猛力一绞，钩尖竟似活物般扭转方向，从意想不到的角度勾向$n关节要害",
	"$N眼中凶光毕露，$w带着一股阴风横扫而出，五毒之气弥漫四周，$n但觉头晕目眩"
];
this.parry_actions = [
	"$n手中$w反手一钩，以攻为守地勾向$N腕脉，逼得$N匆忙收招",
	"$n将$w在身前舞出一道绿色光弧，五毒之气弥漫开来，$N的攻势不敢轻易递入",
	"$n身形诡异游走，$w如毒蝎摆尾般从身后甩出，将$N的$w牢牢锁住",
	"$n钩法阴狠，$w连消带打，不但化解了$N的攻势，更顺势反钩$N的$l",
	"$n毒钩急转，$w化作一团碧绿色的钩影旋风，$N的$w刺入其中便如被五毒噬咬，攻势登时溃散"
];
this.desc = "五毒教的高级剑法，阴狠毒辣";
this.can_enables = ["sword", "parry"];
this.learn_condition = {
	max_mp: 3000,
	skill: { sword: 300 }
};

this.query_enable_prop = function (lv) {
	return {
		sword: {
			str: parseInt(lv * 201.0 / 1000),
			mz: Math.floor(1.4 * lv + 10),
			desc: "当你命中敌人后对敌人造成毒素伤害",
		},
		parry: {
			zj: Math.floor(1.4 * lv + 10),
			fy: Math.floor(1.4 * lv + 10),
		},
	}
}

this.on_attack_over = function (me, target, par, sh) {
	if (!par.is_dodge && !par.is_parry && sh > 0) {
		var lv = me.query_skill("wudugoufa", 0);
		var dps = Math.floor(lv * 2 + me.gj * 0.3);
		target.add_status({
			id: "wudu_poison",
			name: "五毒",
			desc: "你中了五毒钩法的剧毒，每三秒减少" + dps + "气血",
			duration: parseInt(lv * 5),
			duration_count: 5,
			downside: true,
			override: 1,
			data: { dps: dps },
			start_msg: "<HIG>$n被五毒钩的剧毒侵入体内，伤口发黑，剧痛难忍！</HIG>",
			finish_msg: "<CYN>$n体内的五毒终于被压制下去。</CYN>",
			on_interval: function (target, count) {
				var dps = this.data ? this.data.dps : 0;
				target.from_attack(dps * count, 999999, null, "<HIG>$N五毒发作，浑身剧痛！</HIG>");
			},
		});
	}
}

this.pfm = {
	pfm1: {
		name: "金钩锁魂",
		distime: 25000,
		enable_skill: "sword",
		release_time: 3096,
		mp: 25,
		use: function (me, target, lv) {
			me.send_room("<HIR>$N喉中发出一声凄厉的尖啸，手中$w骤然间绿光大盛——「金钩锁魂」！$w上淬炼的五种剧毒同时被内力激发，钩尖爆射出五色毒芒！$N身形暴起，$w化作一道撕裂空气的碧绿闪电，直钩$n的兵器！这一钩快、准、狠、毒，四字俱全，仿佛阎罗殿前索命的钩镰使者，要将$n的魂魄从躯壳中硬生生钩出！</HIR>", target);
			var weap = target.query_weapon();
			var disarmed = false;
			if (weap && weap.weapon_type !== WEAPON_TYPE.NONE) {
				// 计算钩法等级评价指数
				var myEval;
				if (lv < 1000)
				myEval = parseInt(lv / 50);
				else {
					var v = parseInt((lv - 1000) / 500);
					if (v > 6) v = 6;
					myEval = v + 20;
				}
				// 计算敌人武功总体评价指数
				var targetLv = target.attack_skill ? target.query_skill(target.attack_skill.id) : 0;
				var targetEval;
				if (targetLv < 1000)
				targetEval = parseInt(targetLv / 50);
				else {
					var v2 = parseInt((targetLv - 1000) / 500);
					if (v2 > 6) v2 = 6;
					targetEval = v2 + 20;
				}
				// 评价大于等于时，有概率下武器成功
				if (myEval >= targetEval) {
					var rate = 50 + (myEval - targetEval) * 10;
					if (rate > 90) rate = 90;
					if (me.random(100) < rate) {
						target.unequip(weap, true, 10000);
						disarmed = true;
						me.send_room("<HIR>$n手腕一麻，手中" + weap.name + "被$N的「金钩锁魂」硬生生钩落在地！</HIR>", target);
					}
				}
			}
			if (disarmed) {
				for (var i = 0; i < 4; i++) {
					me.do_attack({
						target: target,
						gj: me.gj,
						mz: me.mz,
					});
				}
			} else {
				me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz,
				});
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "打掉对方兵器，成功后继续攻击对方4次，等级越高成功率越高";
		}
	}
};
