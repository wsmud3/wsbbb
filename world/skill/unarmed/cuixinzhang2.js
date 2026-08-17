this.inherits(SKILL);
this.name = "摧心掌";
this.id = "cuixinzhang2";
this.grade = 3;
this.desc = "摧心掌";
this.can_enables = ["unarmed"];
this.attack_actions = [
	"$N双掌运劲，摧心掌力暗暗涌出，一股阴柔内劲直透$n的$l脏腑",
	"$N掌风阴柔，看似轻描淡写地拍向$n，实则暗藏摧心裂肺之力",
	"$N面露冷笑，一招「摧心断脉」使出，掌力无声无息已印至$n胸口",
	"$N身形飘忽，摧心掌之「阴风透骨」施展开来，掌劲如毒蛇般钻入$n体内",
	"$N双掌连环拍出，一式「九幽摧魂」带着刺骨寒意袭向$n的$l",
	"$N沉声低喝，「碎心裂胆」绝招出手，掌风虽缓却让$n避无可避",
	"$N掌心暗含阴劲，摧心掌「无形无相」悄然印出，$n只觉心头一颤",
	"$N运足十成功力，摧心掌杀招「魂飞魄散」轰然击出，直取$n心脉要害"
];
this.parry_actions = [
	"$n双掌翻转，以摧心掌的阴柔劲力将$N的攻击悄然化解于无形",
	"$n不慌不忙，一招「绵里藏针」施出，以柔克刚将$N的攻势尽数消弭",
	"$n身形后撤半步，摧心掌「阴劲护体」运转，$N的攻击被阴柔之力层层抵消",
	"$n手掌轻拂，一式「以柔破刚」巧妙使出，$N的猛攻如击棉絮无处着力",
	"$n凝神以待，摧心掌守招「心若止水」展开，双掌翻飞将$N攻势悉数封住"
];
this.learn_condition = {
	max_mp: 3000,
	skill: { unarmed: 300 }
};
this.query_enable_prop = function (lv) {
	return {
		unarmed: {
			gj: parseInt(lv * 1.5) + 20,
			mz: parseInt(lv * 1.4) + 20,
		}
	};
}
this.pfm = {
	pfm1: {
		name: "摧心",
		distime: 20000,
		enable_skill: "unarmed",
		release_time: 3096,
		mp: 25,
		use: function (me, target, lv) {
			me.send_room("<HIR>$N掌含阴毒——「摧心」！摧心掌力直透$n体内，阴毒潜伏，随时爆发！</HIR>", target);
			if (me.do_attack({
				target: target,
				gj: me.gj * 2,
				mz: me.mz,
			})) {
				target.add_status({
					id: "cuixin",
					name: "摧心毒",
					desc: "阴毒潜伏体内，" + (Math.min(2000 + parseInt(lv * 5), 7000) / 1000) + "秒后毒发昏迷",
					duration: Math.min(2000 + parseInt(lv * 5), 7000),
					downside: true,
					on_expire: function(who) {
						who.add_status({
							id: "faint",
							name: "昏迷",
							desc: "摧心毒发，昏迷不醒",
							is_faint: true,
							duration: 4000,
							downside: true,
						});
					},
				});
			}
			me.end_attack(target)
		},
		query_desc: function (me, lv) {
			return "对敌人造成你200%伤害，并使敌人受到阴毒伤害，" + (Math.min(2000 + parseInt(lv * 5), 7000) / 1000) + "秒后毒发昏迷4秒。";
		}
	}
};
