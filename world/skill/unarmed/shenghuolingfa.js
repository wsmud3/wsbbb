this.inherits(SKILL);
this.name = "圣火令法";
this.id = "shenghuolingfa";
this.grade = 2;
this.attack_actions = [
		"$N手持圣火令，招式奇诡莫测，令$n眼花缭乱不辨虚实",
		"$N圣火令法非中土武功，招招出人意料，打向$n的$l",
		"$N口中念诵波斯咒文，一招「圣火焚心」使出，圣火令带着灼热之气袭向$n",
		"$N身形诡异扭曲，圣火令法「西域奇招」施出，从不可思议的角度击向$n",
		"$N双令交错，一式「光明普照」光芒耀眼，圣火令化作两道流光刺向$n的$l",
		"$N翻转腾挪，圣火令法「魔影重重」展开，$n只觉四面八方皆是令影",
		"$N厉喝一声，圣火令「烈火燎原」横扫而出，势如燎原之火笼罩$n",
		"$N运足内力，圣火令法至高绝技「圣火不灭」全力施为，令影如狂风暴雨袭向$n"
	];
this.parry_actions = [
		"$n圣火令交叉格挡，一招「光明护体」施出，$N的攻击被双令牢牢封住",
		"$n身形侧转，圣火令法「波斯铁壁」守势展开，将$N的攻势尽数挡下",
		"$n令随身走，一式「圣火回旋」以诡异手法将$N的攻击力道卸向一旁",
		"$n双令翻飞如蝶，圣火令法「西域奇门」守招施出，$N的猛攻被层层化解",
		"$n口诵真言，圣火令法「烈火金刚」守势运转，$N的攻击撞上令身发出金铁之声"
	];
this.desc = "明教圣火令上所载的武功，诡异莫测";
this.can_enables = ["sword"];
this.learn_condition = {
		max_mp: 2000,
		skill: { sword: 200 }
	};

this.query_enable_prop = function (lv) {
		return {
			sword: {
				gj: parseInt(lv * 1.4) + 10,
				mz: parseInt(lv * 1.4) + 20,
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "圣火焚烧",
			distime: 20000,
			enable_skill: "sword",
			release_time: 3000,
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<HIR>$N双手结圣火印——「圣火焚烧」！$N周身燃起熊熊圣火，火焰化作无数火球向四周的敌人轰去！</HIR>", me);
				var env = me.environment;
				if (env) {
					var chars = env.query_all_enemy(me);
					for (var j = 0; j < chars.length; j++) {
						var c = chars[j];
						if (c !== me && me.is_fighting(c)) {
							for (var k = 0; k < 3; k++) {
								me.do_attack({
									target: c,
									gj: me.gj,
									mz: me.mz,
								});
							}
						}
					}
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "对附近敌人每人攻击三次";
			}
		}
	};
