this.inherits(SKILL);
this.name = "如来神掌";
this.id = "rulaishenzhang";
this.grade = 5;
this.desc = "佛门至高绝学，传说为释迦牟尼所创，一掌出而万佛朝宗。";
this.can_enables = ["unarmed"];
this.attack_actions = [
	"$N双掌合十，佛光普照十方世界，一掌拍出直取$n，掌风之中隐隐有梵唱之声",
	"$N掌中金光大盛如烈日当空，如来神掌的浩瀚佛力化作金色巨浪涌向$n",
	"$N口诵佛号，掌力如山岳般压下，万钧之势笼罩$n全身，令人心生敬畏",
	"$N掌心浮现「卍」字佛印，金光流转间如来神掌的降魔之力排山倒海般推向$n",
	"$N双掌齐出，梵音阵阵响彻云霄，如来神掌的慈悲与威严同时化作实质笼罩$n",
	"$N一掌自上而下如佛陀降世，掌心金莲绽放，如来神掌携无上威能轰向$n",
	"$N掌势凝重如须弥山移，每推出一寸便有一道佛光迸发，层层叠叠压向$n",
	"$N默诵金刚般若经，掌中佛力凝聚如琉璃实质，一掌拍出天地为之色变"
];
this.parry_actions = [
	"$n双掌合十，周身佛光化作金钟护体，$N的攻击如击铜钟发出嗡然回响",
	"$n口诵佛号，如来神掌的护体真气化作莲花瓣瓣绽放，将$N的攻势尽数化去",
	"$n掌中佛光流转如波，轻轻一托便将$N的攻击引向无边虚空，消散于无形",
	"$n端坐如佛，周身金光大放，梵音缭绕之中$N的招式竟无法近身分毫"
];
this.learn_condition = {
	max_mp: 8000,
	skill: { unarmed: 800 }
};
this.query_enable_prop = function (lv) {
	return {
		unarmed: {
			gj: parseInt(lv * 1605 / 1000),
			mz: parseInt(lv * 1805 / 1000),
			mz_per: 8,
			gj_per: 8,
		}
	};
};
this.pfm = {
	pfm1: {
		name: "万佛朝宗",
		distime: 25000,
		enable_skill: "unarmed",
		release_time: 3000,
		mp: 30,
		use: function (me, target, lv) {
			me.send_room("<hio>$N双掌推出，万道佛光自掌心迸发，虚空之中隐隐浮现诸佛法相，梵音齐鸣，正是如来神掌之「万佛朝宗」！天地为之震动。</hio>", target);
			// AoE: hit all enemies in the room
			var enemies = me.enemy ? me.enemy.filter(function(e) { return e && e.hp > 0; }) : [];
			if (enemies.length === 0 && target && target.hp > 0) enemies = [target];
			var totalDmg = 0;
			for (var i = 0; i < enemies.length; i++) {
				var e = enemies[i];
				if (!e || e.hp <= 0) continue;
				// Force-based damage: 20% of attacker's max_mp as bonus damage
				var bonusDmg = Math.floor(me.max_mp * 0.2);
				me.do_attack({target: e, damage_msg: "<hio>$N的万佛朝宗佛光普照，金光如潮水般涌过$n全身，造成内劲伤害！</hio>", gj: me.gj + bonusDmg});
				if (me.record_damage && e.sum_damages) totalDmg += (e.sum_damages || 0);
			}
			// Heal based on damage dealt
			if (totalDmg > 0) {
				var heal = Math.floor(totalDmg * 0.3);
				me.do_recover(heal);
				me.notify("<hig>万佛朝宗吸纳" + heal + "点伤害化为气血！</hig>");
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "对附近敌人造成内力伤害（附加内力上限20%），将造成伤害的30%转化为气血。万佛朝宗，普度众生。";
		}
	},
	pfm2: {
		name: "灭魔",
		distime: 40000,
		enable_skill: "unarmed",
		release_time: 3000,
		mp: 30,
		use: function (me, target, lv) {
			me.send_room("<hio>$N身形跃起如大鹏展翅，一掌从天而降，掌风呼啸似天雷滚滚，掌心金光凝聚如烈日陨落，正是如来神掌之「灭魔」！</hio>", target);
			// Damage scales with defense and damage reduction
			var bonusDmg = Math.floor(me.fy * 0.5 + me.diff_sh_per * me.gj * 0.01);
			me.do_attack({target: target, gj: me.gj + bonusDmg, damage_msg: "<hir>$N的灭魔一掌如天罚降临，金光贯穿天地！</hir>"});
			// Stun the target for 3 seconds
			if (target && target.hp > 0) {
				target.add_status({
					id: "miemo_stun",
					name: "昏迷",
					desc: "被如来神掌灭魔击中，陷入昏迷",
					duration: Math.min(parseInt(lv * 5), 5000),
					downside: true,
					override: 1,
					prop: { busy: 999999 },
					start_msg: "<hir>$N被灭魔掌力震得昏迷过去，七窍隐隐有金光溢出！</hir>",
					finish_msg: "$N从昏迷中醒来。",
				});
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "一式从天而降的掌法，伤害附加防御50%+免伤%×攻击力，命中造成" + (Math.min(parseInt(lv * 5), 5000) / 1000) + "秒昏迷。降魔卫道，一掌灭魔。";
		}
	}
};
