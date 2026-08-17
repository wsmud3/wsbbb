this.inherits(SKILL);
this.name = "泰山拳法";
this.id = "taishanquanfa";
this.grade = 2;
this.desc = "泰山拳法";
this.can_enables = ["unarmed"];
this.attack_actions = [
	"$N泰山拳法沉稳如山，拳力雄浑，直击$n的$l",
	"$N一拳既出，如泰山压顶，气势磅礴令人窒息",
	"$N沉腰扎马，一招「泰山压顶」蓄势而发，拳风如万钧巨石砸向$n",
	"$N双拳连环击出，泰山拳法「五岳独尊」施展开来，$n只觉拳影如群山压至",
	"$N身如磐石，一式「南天门开」拳劲纵横，直捣$n中宫要害",
	"$N脚步沉重如岳，泰山拳法「一览众山小」悍然出手，拳力自高处贯下",
	"$N吐气开声，一招「日出泰山」拳势光明正大，以堂堂之阵压向$n",
	"$N须发皆张，泰山拳法绝学「泰山崩于前」全力施展，拳力撼天动地轰向$n"
];
this.parry_actions = [
	"$n双臂十字交叉，泰山拳法「磐石不动」守势施出，$N的攻击如撞山岳",
	"$n沉肘护胸，一招「松柏长青」稳固如山，$N的猛攻被沉稳拳劲一一挡住",
	"$n身形微沉，泰山拳法「中流砥柱」展开，双拳如石柱般封住$N来路",
	"$n以静制动，一式「岳峙渊渟」从容格挡，$N的攻击如浪击礁石自行溃散",
	"$n踏步向前，泰山拳法守招「泰山石敢当」硬桥硬马，$N的奋力一击被震回"
];
this.learn_condition = {
	max_mp: 2000,
	skill: { unarmed: 200 }
};
this.query_enable_prop = function (lv) {
	return {
		unarmed: {
			gj: parseInt(lv * 1.3) + 10,
			str: parseInt(lv * 125.0 / 1000),
			fy: parseInt(lv * 1.5) + 10,
		}
	};
}
this.pfm = {
	pfm1: {
		name: "泰山压顶",
		distime: 20000,
		enable_skill: "unarmed",
		release_time: 3096,
		mp: 20,
		use: function (me, target, lv) {
			me.send_room("<HIW>$N沉腰扎马——「泰山压顶」！拳风如万钧巨石从天而降，挟泰山之势砸向$n！</HIW>", target);
			me.do_attack({
				target: target,
				gj: me.gj + me.fy * 2,
			});
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "对敌人造成你攻击力附加你200%防御的伤害";
		}
	}
};
