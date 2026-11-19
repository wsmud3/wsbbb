this.inherits(SKILL);
this.name = "秋风拂尘";
this.id = "qiufengfuchen";
this.grade = 1;

this.attack_actions = [
	"$N端坐不动，一招<HIC>「秋风拂叶」</HIC>，手中$w带着一股劲风，击向$n的脸颊",
	"$N单臂一挥，一招<HIW>「玉带围腰」</HIW>，手中$w直绕向$n的身后",
	"$N身形一转，一招<HIB>「流云断川」</HIB>，手中$w如矫龙般腾空一卷，猛地向$n劈头打下",
	"$N力贯尘梢，一招<HIG>「春风化雨」</HIG>，手中$w舞出满天幻影，排山倒海般扫向$n全身",
	"$N忽的向前一跃，一招<HIY>「野马分鬃」</HIY>，手中$w分击$n左右",
	"$N慢步上前，一招<GRN>「竹影扫阶」</GRN>，手中$w缓缓罩向$n前胸"

];
this.desc = "古墓派李莫愁扬名天下的武功。";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["whip"];

this.query_enable_prop = function (lv) {
	return {
			whip: {
				gj: lv * 1 + 10,
				mz: lv * 1,
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "缠字诀",
			distime: 30000,
			enable_skill: "whip",
			release_time: 3096,
			mp: 15,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N拂尘如秋风扫叶——「缠字诀」！$w化作千丝万缕缠向$n，将其手脚牢牢束缚！</HIG>", target);
				// 进阶槽：qffc_mz 为命中百分比加成，qffc_ml 为忙乱时间增加的毫秒数（原先两项都没人读取）
				if (me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz * (100 + me.query_prop("qffc_mz")) / 100,
				})) {
					target.add_status({
						id: "busy",
						name: "忙乱",
						desc: "被缠字诀所困，无法攻击和招架",
						is_busy: true,
						duration: Math.min(5000 + parseInt(lv * 5), 10000) + me.query_prop("qffc_ml"),
						downside: true,
					});
				}
				me.end_attack(target)
},
			query_desc: function (me, lv) {
				return "如秋风扫叶般，快速挥动佛尘牵制敌人，使敌人" + ((Math.min(5000 + parseInt(lv * 5), 10000) + (me && me.query_prop ? me.query_prop("qffc_ml") : 0)) / 1000) + "秒内处于忙乱状态。";
			}
		}
	};
;

//this.on_learn = function (me) {
//    if (me.max_mp < 100)
//        return me.notify_fail("你的内力不够。");
//    if (me.query_skill("sword", 1) < 60)
//        return me.notify_fail("你的基础不够，无法领会更高深的技巧。");
//    if (me.query_skill("yunlongxinfa", 1) < 60)
//        return me.notify_fail("你的云龙心法等级不够，无法学习云龙剑。");
//    return true;
//}

