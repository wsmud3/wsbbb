this.inherits(SKILL);
this.name = "云龙鞭法";
this.id = "yunlongbian";
this.grade = 1;

this.attack_actions = [
	"$N单手一扬，一招「开天辟地」，手中$w抖得笔直，对准$n当头罩下",
	"$N身形一转，一招「龙腾四海」，手中$w如矫龙般腾空一卷，猛地击向$n太阳穴",
	"$N唰的一抖长鞭，一招「矫龙出水」，手中$w抖得笔直，刺向$n双眼",
	"$N力贯鞭梢，一招「破云见日」，手中$w舞出满天鞭影，排山倒海般扫向$n全身",
	"$N运气于腕，一招「开山裂石」，手中$w象一根铜棍般直击向$n",
	"$N单臂一挥，一招「玉带围腰」，手中$w直击向$n腰肋",
	"$N高高跃起，一招「大漠孤烟」，手中$w笔直向$n当头罩下"

	];
this.desc = "云龙门";
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
				me.send_room("<HIW>$N鞭法诡异刁钻——「缠字诀」！$w如灵蛇般缠向$n，将其手脚牢牢束缚！</HIW>", target);
				if (me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz,
				})) {
					target.add_status({
						id: "busy",
						name: "忙乱",
						desc: "被缠字诀所困，无法攻击和招架",
						is_busy: true,
						duration: Math.min(5000 + parseInt(lv * 5), 10000),
						downside: true,
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "以诡异刁钻的鞭法缠住敌人，使敌人" + (Math.min(5000 + parseInt(lv * 5), 10000) / 1000) + "秒内处于忙乱状态，无法攻击，招架";
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
