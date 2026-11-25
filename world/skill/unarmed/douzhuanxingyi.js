this.inherits(SKILL);
this.name = "斗转星移";
this.id = "douzhuanxingyi";
this.grade = 5;
this.attack_actions = [
	"$N斗转星移施展开来，移花接木，借力打力，一招之间蕴含无穷变化",
	"$N身形一转，斗转星移之间，$n的攻击被巧妙地反拨回去，如镜花水月般颠倒乾坤",
	"$N双掌虚抱成圆，斗转星移劲力吞吐如潮，$n的攻势竟被无形之力引向自身",
	"$N足踏八卦方位，掌运日月乾坤，斗转星移的玄妙力道将$n的招式尽数反转",
	"$N衣袖轻拂若行云流水，看似退避三舍，实则斗转星移的杀招已悄然反手攻向$n",
	"$N以彼之道还施彼身，斗转星移之下星光流转，$n只觉自己的力道竟悉数反噬而来",
	"$N身形如陀螺般急转，斗转星移带起一阵旋风，星光闪烁间将$n卷入其中",
	"$N双手一圈一引，斗转星移的巧劲如星河流转，$n的攻击被化为己用反向击出"
];
this.parry_actions = [
	"$n运起斗转星移，星光护体，$N只觉自己的招式如泥牛入海，劲力竟被反震而回",
	"$n身形微侧，斗转星移施展开来如星河倒悬，$N的攻击偏转方向反朝自己而来",
	"$n双臂抱圆，斗转星移将$N的力道尽数吸纳，随即以加倍之势奉还，宛若星辰爆裂",
	"$n看似轻轻一拨，实则斗转星移已化去$N的攻势，劲力如流星逆转反向而至"
];
this.desc = "姑苏慕容家传绝学，可反弹对手的攻击";
this.can_enables = ["unarmed"];
this.learn_condition = {
	max_mp: 5000,
	skill: { unarmed: 500 }
};

this.query_enable_prop = function (lv) {
	return {
		unarmed: {
			zj: parseInt(lv * 2200 / 1000),
			fy: parseInt(lv * 2200 / 1000),
			diff_bj: 4,
			dex: parseInt(lv * 333.0 / 1000),
		},
	}
}

this.pfm = {
	pfm1: {
		name: "星移",
		distime: 30000,
		enable_skill: "unarmed",
		release_time: 3096,
		mp: 30,
		use: function (me, target, lv) {
			me.send_room("<HIM>$N双手虚引——「星移」！$N周身气劲流转，招架之势如星辰移位，变幻莫测！</HIM>", me);
			me.add_status({
				id: "xingyi",
				name: "星移",
				desc: "招架增加" + (30 + parseInt(lv / 100)) + "%，招架成功反弹150%伤害",
				duration: parseInt(lv * 10),
				prop: { zj_per: 30 + parseInt(lv / 100) },
				// 招架成功后，把这一击本应对自己造成的伤害（按自身免伤/防御结算后，由引擎估算传入）的150%反弹给攻击者。
				// 反弹量已是结算后的数值，故对攻击者以 diff_fy=100 结算，不再重复扣防御与百分比免伤。
				// 原先写在 on_parry_over 里，而本技能只能装在拳脚位，招架位钩子永远不会被调用；且按攻击力而非伤害计算。
				on_parry_success: function (owner, attacker, par, taken) {
					if (!attacker || attacker === owner || attacker.hp <= 0) return;
					var reflected = parseInt(taken * 1.5);
					if (!(reflected > 0)) return;
					var dealt = attacker.damage(reflected, owner, 100, { kind: "reflect" });
					if (dealt > 0) owner.send_room("<HIM>$N的星移之力星光流转，将" + dealt + "点伤害反弹给$n！</HIM>", attacker);
				},
			});
		},
		query_desc: function (me, lv) {
			return "" + (parseInt(lv * 10 / 1000)) + "秒内，增加你" + (30 + parseInt(lv / 100)) + "%的招架，招架成功后将伤害的150%反弹给敌人。星光护体，斗转乾坤。";
		}
	},
	pfm2: {
		name: "斗转",
		distime: 30000,
		enable_skill: "unarmed",
		release_time: 3096,
		mp: 30,
		use: function (me, target, lv) {
			// 按说明：用「前一个攻击你的武器或拳脚绝招」攻击敌人，等级取你的斗转星移等级。
			// 绝招记录在内存 mem "sk/last_hit_pfm"（pfm.js / auto_combat.js 在绝招释放成功后写到目标身上，10 秒内有效（超时清空，被新绝招打中则覆盖），不存档）。
			// 没有可用的记录时退回原效果：以对方的攻击力和命中反击一次。
			var DZ_BASES = ["sword", "blade", "club", "staff", "whip", "unarmed"];
			var lastId = me.query_mem("sk/last_hit_pfm");
			var copied = null;
			if (typeof lastId === "string" && lastId !== "douzhuanxingyi/pfm2") {
				var sl = lastId.indexOf("/");
				var srcSkill = sl > 0 ? SKILL.get(lastId.slice(0, sl)) : null;
				var srcPfm = srcSkill && srcSkill.get_pfm(lastId.slice(sl + 1));
				// grade 6 绝招不能斗转；自创武学里融合来的绝招按来源技能的品级算
				var gradeSkill = srcPfm && srcPfm.source_skill ? SKILL.get(srcPfm.source_skill) : srcSkill;
				var srcGrade = gradeSkill ? (parseInt(gradeSkill.grade) || 0) : 0;
				if (srcPfm && typeof srcPfm.use === "function" && DZ_BASES.indexOf(srcPfm.enable_skill) >= 0 && srcGrade < 6) copied = srcPfm;
			}
			if (copied) {
				me.send_room("<HIB>$N长啸一声，斗转星移之「斗转」全力激发——漫天星光为之黯淡！$N以彼之道还施彼身，使出了" + copied.name + "！</HIB>", target);
				try { copied.use(me, target, lv); }
				catch (e) { console.error("斗转 复制绝招 %s 出错:", lastId, (e && e.stack) || e); }
				me.end_attack(target);
				return;
			}
			me.send_room("<HIB>$N长啸一声，斗转星移之「斗转」全力激发——漫天星光为之黯淡！$N以斗转星移之力反击$n！</HIB>", target);
			me.do_attack({
				target: target,
				gj: target.gj,
				mz: target.mz,
				attack_msg: "<HIB>$N以彼之道还施彼身，将$n的攻击力化为己用反击而出！</HIB>",
			});
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "使用前一个攻击你的武器或拳脚绝招（六品武学除外）攻击敌人，效果是你斗转星移等级的100%。以彼之道，还施彼身。";
		}
	}
};
