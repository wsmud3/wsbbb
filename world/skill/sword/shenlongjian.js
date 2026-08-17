	this.inherits(SKILL);
	this.name = "神龙剑";
	this.id = "shenlongjian";
	this.grade = 1;

	this.attack_actions = [
		"$N使一式「<BLK>潮泛银海</BLK>」，手中$w疾挽，漫天寒光，隐夹风雷之声，闪电般狂涌向$n的$l",
		"$N错步上前，使出「<RED>银雨飞花</RED>」，手中$w登时剑芒暴射，宛如漫天瑞雪飞洒向$n的$l",
		"$N手中$w一抖，一招「<GRN>花影滨飞</GRN>」，$w犹如狂风扫落叶般急攻向$n的$l",
		"$N手中$w锵啷啷长吟一声，一式「<BLU>神龙寻食</BLU>」，$w头上脚下洒攻而下，攻势之疾，无以伦比向$n的$l",
		"$N一式「<MAG>西风倒卷</MAG>」，手中$w将剑自下拖上，端的无比毒辣使$n难断虚实，无可躲避",
		"$N手中$w,一式「<BLU>天罗地网</BLU>」，仿佛一面无形的黑网向$n的$l斜斜击出",
		"$N一式「<HIR>日月失色</HIR>」，$w银光万道，如江河倒泻，剑芒绵绵无尽向$n的胸口递去",
		"$N一式「<YEL>金针渡劫</YEL>」，$w形神合一，把全部真气贯注剑身之上，快如天光乍闪向$n刺去"

		];
	this.desc = "神龙教的剑法";
	//<$1>$2</$1>
	//<$1>$2</$1>
	this.can_enables = ["sword"];

	this.query_enable_prop = function (lv) {
		return {
				sword: {
					gj: lv * 1 + 10,
				},
			}
		};

	this.pfm = {
		pfm1: {
				name: "神龙天降",
				distime: 10000,
				enable_skill: "sword",
				release_time: 3096,
				mp: 15,
				use: function (me, target, lv) {
					me.send_room("<HIY>$N剑法诡异——「神龙天降」！$N身形一闪便到了$n面前，令$n措手不及！</HIY>", target);
					if (me.do_attack({
						target: target,
						gj: me.gj,
						mz: me.mz,
					})) {
						target.add_status({
							id: "busy",
							name: "忙乱",
							desc: "被神龙天降突袭，手忙脚乱",
							is_busy: true,
							duration: Math.min(parseInt(lv * 5), 10000),
							downside: true,
						});
					}
					me.end_attack(target)
				},
				query_desc: function (me, lv) {
					return "诡异的剑法迷惑敌人，命中后对敌人造成伤害，并且使敌人忙乱" + (Math.min(parseInt(lv * 5), 10000) / 1000) + "秒。";
				}
			}
		};
