this.inherits(SKILL);
this.name = "真言手印";
this.id = "zhenyanshouyin";
this.grade = 5;
this.desc = "九字真言手印含天地之秘，通过人体而与宇宙沟通，达致天人合一之境，明心见性，即身成佛。";
this.can_enables = ["unarmed"];
this.attack_actions = [
	"$N手结法印，真言之力化作无形波纹荡漾开来，直取$n",
	"$N口诵真言，手印翻转间佛光乍现如旭日东升，浩瀚之力涌向$n",
	"$N双手结「临」字印，身如不动明王，真言之力如金刚杵般破空撞向$n",
	"$N手印变幻如飞，从「兵」字印转至「斗」字印，真言之力层层叠加如浪涌",
	"$N十指翻飞如莲花绽放，九字真言手印连环结出，梵音震耳欲聋响彻四方",
	"$N结「列」字印，真言之力化作漫天金色光雨，铺天盖地洒向$n",
	"$N手结「在」字印，真言之力化为金身法相浮于身后，一掌推出气吞山河",
	"$N双手结大日如来印，真言之力如烈日当空，万丈光芒照彻$n周身"
];
this.parry_actions = [
	"$n结不动根本印，真言之力化作金刚护盾层层叠叠，$N的攻击如击山岳徒劳无功",
	"$n口诵「临」字真言，周身佛光屏障如琉璃罩展开，将$N的招式尽数挡下",
	"$n手结大金刚轮印，梵文流转于虚空，$N只觉攻击如击虚空无处着力",
	"$n以真言之力护体，金色佛光璀璨夺目，$N的攻势在触到光芒时便已消散无形"
];
this.learn_condition = {
	max_mp: 8000,
	skill: { unarmed: 800 }
};
this.query_enable_prop = function (lv) {
	return {
		unarmed: {
			gj: parseInt(lv * 2100 / 1000),
			str: parseInt(lv * 340 / 1000),
			mz: parseInt(lv * 1830 / 1000),
		}
	};
};
this.pfm = {
	pfm1: {
		name: "九字真言",
		distime: 15000,
		enable_skill: "unarmed",
		release_time: 0,
		mp: 30,
		use: function (me, target, lv) {
			me.send_room("<hio>$N双手结印如飞，口吐梵音：「临！兵！斗！者！皆！阵！列！在！前！」九字真言化作九道金光破空而出，天地为之共鸣！</hio>", target);
			// Deal pure force damage based on str * lv
			var dmg = Math.floor(me.str * lv / 100);
			if (target && target.hp > 0) {
				target.damage2(dmg, me);
				me.send_combat("<wht>$N的真言之力如天雷贯顶般对$n造成了" + dmg + "点伤害！</wht>", target);
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "真言伤人，造成（臂力×技能等级/100）的固定伤害。九字真言，言出法随。";
		}
	},
	pfm2: {
		name: "不死法印",
		distime: 30000,
		enable_skill: "unarmed",
		release_time: 0,
		use_type: 2,
		allow_busy: true,
		mp: 30,
		use: function (me, target, lv) {
			me.send_room("<hio>$N双手结「不死法印」，眉心绽放金色莲花印记，周身萦绕璀璨佛光护盾，梵音袅袅如天籁之音！</hio>", target);
			var shield = Math.floor(me.gj * 1.05);
			me.add_status({
				id: "busi_fayin",
				name: "不死法印",
				desc: "固定免伤" + shield + "点",
				duration: parseInt(lv * 10),
				downside: false,
				override: 2,
				prop: { diff_sh: shield },
				start_msg: "<hio>$N获得了" + shield + "点固定免伤，持续8秒！</hio>",
				finish_msg: "$N的不死法印消散了。",
			});
		},
		query_desc: function (me, lv) {
			return "真言守护，将105%的攻击力转化为固定免伤，持续" + (parseInt(lv * 10 / 1000)) + "秒。不死法印，金刚不坏。";
		}
	}
};
