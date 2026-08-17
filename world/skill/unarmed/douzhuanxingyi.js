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

// 星移：招架成功后反弹150%伤害
this.on_parry_over = function (me, from, par) {
	if (me.query_temp("xingyi_reflect") && par.is_parry) {
		var reflected = parseInt(from.gj * 1.5);
		if (reflected > 0) {
			from.damage(reflected, me, 0);
			me.send_room("<HIM>$N的星移之力星光流转，将" + reflected + "点伤害反弹给$n！</HIM>", from);
		}
	}
};

this.pfm = {
	pfm1: {
		name: "星移",
		distime: 30000,
		enable_skill: "unarmed",
		release_time: 3096,
		mp: 30,
		use: function (me, target, lv) {
			me.send_room("<HIM>$N双手虚引——「星移」！$N周身气劲流转，招架之势如星辰移位，变幻莫测！</HIM>", me);
			me.set_temp("xingyi_reflect", 1);
			me.add_status({
				id: "xingyi",
				name: "星移",
				desc: "招架增加" + (30 + parseInt(lv / 100)) + "%，招架成功反弹150%伤害",
				duration: parseInt(lv * 10),
				prop: { zj_per: 30 + parseInt(lv / 100) },
				on_expire: function(p) {
					p.remove_temp("xingyi_reflect");
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
			// 只对武器和拳脚类型的敌人攻击技能生效
			var enemySkill = target.attack_skill;
			var canCounter = enemySkill && (
				enemySkill.can_enables && (
					enemySkill.can_enables.indexOf("sword") >= 0 ||
					enemySkill.can_enables.indexOf("blade") >= 0 ||
					enemySkill.can_enables.indexOf("club") >= 0 ||
					enemySkill.can_enables.indexOf("staff") >= 0 ||
					enemySkill.can_enables.indexOf("whip") >= 0 ||
					enemySkill.can_enables.indexOf("unarmed") >= 0
				)
			);
			if (canCounter) {
				me.send_room("<HIB>$N长啸一声，斗转星移之「斗转」全力激发——漫天星光为之黯淡！$N将" + enemySkill.name + "的攻势尽数反转，以彼之道还施彼身！</HIB>", target);
			} else {
				me.send_room("<HIB>$N长啸一声，斗转星移之「斗转」全力激发——漫天星光为之黯淡！$N以斗转星移之力反击$n！</HIB>", target);
			}
			me.do_attack({
				target: target,
				gj: target.gj,
				mz: target.mz,
				attack_msg: "<HIB>$N以彼之道还施彼身，将$n的攻击力化为己用反击而出！</HIB>",
			});
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "使用前一个攻击你的武器或拳脚绝招攻击敌人，效果是你斗转星移等级的100%。以彼之道，还施彼身。";
		}
	}
};
