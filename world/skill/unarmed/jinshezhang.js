this.inherits(SKILL);
this.name = "金蛇游身掌";
this.id = "jinshezhang";
this.grade = 3;

this.attack_actions = [
	"$N双掌一错，一招「千蛇出洞」幻出漫天掌影拢向$n的$l",
	"$N暴喝一声，双掌连环推出，一招「大沼龙蛇」强劲的掌风直扑$n的$l",
	"$N双掌纷飞，一招「双蛇抢珠」直取$n的$l",
	"$N提气缠身游走，一招「游走式」，森森掌风无孔不入般地击向$n的$l",
	"$N盘身错步，双掌平推，凝神聚气，一招「盘身式」拍向$n的$l",
	"$N左掌立于胸前，右掌推出，一招「金蛇吐衅」击向$n$l",
	"$N使出「金蛇翻身咬」，身形凌空飞起，从空中当头向$n的$l出掌攻击",
	"$N使出一招「杯弓蛇影」，左掌化虚为实击向$n的$l",
	"$N左掌画了个圈圈，右掌推出，一招「金蛇缠丝手」击向$n$l",
	"$N使出「灵蛇游八方」，身形散作八处同时向$n的$l出掌攻击",
	"$N使出金蛇游身掌法「金蛇探头」，如鬼魅般欺至$n身前，一掌拍向$n的$l"
	];
this.desc = "金蛇郎君所创的一门掌法";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["unarmed"];
this.learn_condition = {
	max_mp: 3000,
	skill: { unarmed: 300 }
	};

this.query_enable_prop = function (lv) {
	return {
			unarmed: {
				gj: parseInt(lv * 1.3) + 20,
				mz: parseInt(lv * 1.3) + 20,
				dex: parseInt(lv * 166.0 / 1000),
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "金龙升天",
			distime: 26000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 25,
			use: function (me, target, lv) {
				var gj = Math.floor(me.gj * 110 / 100);
				me.send_room("<HIY>$N长啸一声，双掌翻卷——「金龙升天」！金色龙形气劲升腾而起，$n被这股掌力笼罩！</HIY>", target);
				if (me.do_attack({
					target: target,
					gj: gj,
					mz: me.mz,
				})) {
					target.add_status({
						id: "miss",
						name: "金蛇",
						desc: "被金蛇掌力所困，无法闪避",
						is_miss: true,
						duration: 3000 + parseInt(lv * 5),
						downside: true,
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "对敌人造成你攻击力110%的伤害，命中后使敌人在" + (3 + parseInt(lv * 5 / 1000)) + "秒内无法闪避";
			}
		}
	};
