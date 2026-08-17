this.inherits(SKILL);
this.name = "狂风快刀";
this.id = "kuangfengkuaidao";
this.grade = 3;
this.desc = "田伯光的独门快刀，刀出如狂风骤雨，迅捷凌厉，一招未尽一招又至，令对手应接不暇";
this.can_enables = ["blade", "parry"];
this.attack_actions = [
	"$N快刀如电，瞬息之间已向$n连砍数刀",
	"$N手中刀光一闪，快得令人眼花，斩向$n的$l",
	"$N刀法展开，招招抢攻，逼得$n连连后退",
	"$N刀势如狂风骤雨，$w化作一片雪亮刀幕，铺天盖地般向$n卷去",
	"$N身形疾转，$w随身而舞，眨眼间已从三个不同的方向砍向$n，快得只余刀光残影",
	"$N暴喝一声，$w在手中化作一道白色匹练，刀锋破空发出呜呜怪啸，朝$n当头劈下",
	"$N脚踏连环步，$w一刀快过一刀，刀影尚未消散，第二刀第三刀又已劈至，逼得$n喘不过气来",
	"$N眼中杀意如炽，$w斩出漫天刀光，如秋风扫落叶般席卷$n全身，竟是快得无法分辨虚实"
];
this.parry_actions = [
	"$n刀势如风，$w在身前舞出一片雪亮的刀幕，$N的攻势被这狂风般的刀网尽数绞碎",
	"$n以快打快，$w后发先至地劈出数刀，每一刀都精准地封在$N的攻势之前",
	"$n不退反进，$w如旋风般绕着$N的$w急转，竟是以攻为守，逼得$N收招自保",
	"$n刀光霍霍，$w化作一道白色光弧在身周急转，$N的$w无论从哪个方向攻来都被挡了回去",
	"$n冷笑一声，$w连劈带削，狂风快刀的守势同样迅猛，$N的攻势尚未递到便被斩得支离破碎"
];
this.learn_condition = {
	max_mp: 3000,
	skill: { blade: 300 }
};
this.query_enable_prop = function (lv) {
	return {
		blade: {
			gj: parseInt(lv * 1.5 + 10),
			bj_per: 4,
			dex: parseInt(lv * 200.0 / 1000),
		},
		parry: {
			zj: parseInt(lv * 1.3) + 10,
			dex: parseInt(lv * 150.0 / 1000),
			diff_sh_per: 3,
		},
	};
}
this.pfm = {
	pfm1: {
		name: "狂风二十一式",
		distime: 30000,
		enable_skill: "blade",
		release_time: 3096,
		mp: 25,
		use: function (me, target, lv) {
			me.send_room("<HIG>$N刀法如狂风骤雨——「狂风二十一式」！$w化作漫天刀影，二十一记快刀如狂风扫叶般向$n席卷而去！</HIG>", target);
			for (var i = 0; i < 21; i++) {
				me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz,
				});
			}
			me.end_attack(target)
		},
		query_desc: function (me, lv) {
			return "快速攻击敌方21招，攻击期间增加你100%的攻速";
		}
	}
};
