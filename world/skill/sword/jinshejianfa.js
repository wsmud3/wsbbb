	this.inherits(SKILL);
	this.name = "金蛇剑法";
	this.id = "jinshejianfa";
	this.grade = 3;
	this.attack_actions = [
		"$N金蛇剑法诡异莫测，剑尖如金蛇吐信，刺向$n的$l",
		"$N手中长剑曲曲折折，如金蛇蜿蜒，攻向$n意想不到之处",
		"$N剑走偏锋，金蛇剑法的怪招令$n防不胜防",
		"$N手腕一翻，$w如金蛇盘身，从腋下反刺而出，直取$n咽喉",
		"$N剑势忽左忽右，$w蜿蜒游走，宛若金蛇在草丛中穿梭，$n根本无从判断剑从何来",
		"$N身形一矮，$w贴地扫出，如金蛇伏行，一招诡异的攻击直取$n下盘",
		"$N猛然旋身，$w划出一道金色弧光，剑尖颤动如同金蛇狂舞，笼罩$n周身大穴",
		"$N目中闪过一丝诡异的光芒，$w自不可思议的角度刺出——这一剑完全违背武学常理，正是金蛇郎君的独门怪招"
		];
	this.parry_actions = [
		"$n手中$w如金蛇盘绕，画出一个诡异的圆弧，$N的攻势被这怪异的守招尽数荡开",
		"$n剑走偏锋，$w竟从不可能的角度反撩而上，将$N的$w格在半空",
		"$n不守反攻，$w如金蛇吐信般取向$N手腕，以诡异之极的招式逼得$N撤招收势",
		"$n身形诡异地向后一仰，$w从背后反刺而出，竟以这种不可思议的方式将$N的攻势化解",
		"$n手腕连抖，$w幻出数十道金色蛇影，$N的攻击撞入蛇阵之中，立刻被绞得无影无踪"
		];
	this.desc = "金蛇郎君所创的诡异剑法，剑走偏锋";
	this.can_enables = ["sword"];
	this.learn_condition = {
		skill: { sword: 300 }
		};

	this.query_enable_prop = function (lv) {
		return {
				sword: {
					gj: Math.floor(1.3 * lv + 10),
					bj_per: 1 + Math.floor(lv / 200),
					mz: Math.floor(1.3 * lv + 10),
				},

			}
		}

	this.pfm = {
		pfm1: {
				name: "金蛇狂舞",
				distime: 20000,
				enable_skill: "sword",
				release_time: 3096,
				mp: 25,
				use: function (me, target, lv) {
					me.send_room("<HIY>$N眼中精光大盛，手中$w骤然间金光暴涨——「金蛇狂舞」！霎时间，$w化作千百道金色剑影，如同无数条金蛇同时苏醒，在$n周身疯狂舞动，嘶嘶声中金光乱窜，每一道剑影都蕴含着致命的杀机，$n被这铺天盖地的金色蛇影完全吞没！</HIY>", target);
					me.do_attack({target: target});
					me.end_attack(target);
				},
				query_desc: function (me, lv) {
					return "对敌人造成200%攻击力的伤害，命中后使敌人忙乱6秒";
				}
			},
		pfm2: {
				name: "金蛇追魂",
				distime: 30000,
				enable_skill: "sword",
				release_time: 3096,
				mp: 25,
				use: function (me, target, lv) {
					me.send_room("<HIR>$N喉咙深处发出一声低沉如蛇吟的啸声，整个人化作一道金光——「金蛇追魂」！$w在这一刻仿佛活了过来，剑身上隐隐现出金蛇虚影，吐着信子直扑$n而去。这一剑快得超出了视觉的极限，$n甚至来不及眨眼，那致命的金色剑光已到了面门！</HIR>", target);
					if (me.do_attack({target: target})) {
						var stun_dur = Math.min(2000 + parseInt(lv * 5), 6000);
						target.add_status({
							id: "jinshe_faint",
							name: "昏迷",
							desc: "被金蛇追魂震昏",
							duration: stun_dur,
							only_combat: true,
							downside: true,
							is_faint: true,
							start_msg: "<HIR>$n被金蛇追魂击中，顿时昏迷不醒！</HIR>",
							finish_msg: "$n从昏迷中苏醒过来。",
						}, me);
					}
					me.end_attack(target);
				},
				query_desc: function (me, lv) {
					return "对敌人造成伤害，命中后使敌人昏迷，最多6秒";
				}
			}
		};
