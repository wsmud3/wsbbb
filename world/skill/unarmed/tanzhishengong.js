this.inherits(SKILL);
this.name = "弹指神通";
this.id = "tanzhishengong";
this.grade = 4;
this.is_public = true;
this.attack_actions = [
		"$N拇指扣住中指，运起弹指神通，一股凌厉的指风弹向$n的$l",
		"$N手指轻弹，弹指神通劲力如离弦之箭射向$n的面门",
		"$N屈指连弹，数道弹指神通的真力如同飞石般打向$n周身",
		"$N暗运弹指神通，嗤的一声，一道劲风直袭$n的$l",
		"$N左弹右弹，弹指神通使得出神入化，令$n无从闪避",
		"$N聚气于指尖，弹指神通全力弹出，声势惊人",
		"$N五指连弹，弹出五道不同力道的指风，如五音齐鸣，或快或慢袭向$n",
		"$N暗运桃花岛独门内功，弹指神通夹着落英缤纷的幻影弹出，虚实莫测"
	];
this.parry_actions = [
		"$n屈指一弹，一股凌厉的指风嗤然射出，将$N的攻击荡开数尺",
		"$n运起弹指神通心法，指尖轻弹间$N的招式已被击偏数寸，失却准头",
		"$n拇指扣住中指连弹三下，三道弹指神通之劲呈品字形射出，将$N的攻势截断",
		"$n以弹指神通点向$N来招的空隙之处，以攻为守，巧妙化解对方攻势",
		"$n弹出一缕指风，嗤的一声正中$N招式的薄弱之处，如庖丁解牛般游刃有余"
	];
this.desc = "东海桃花岛主黄药师的独门绝技，屈指弹出可碎石断金，精妙无比";
this.can_enables = ["unarmed"];
this.learn_condition = {
		max_mp: 4000,
		skill: { unarmed: 400 }
	};

this.query_enable_prop = function (lv) {
		return {
			unarmed: {
				gj: parseInt(lv * 1.8) + 20,
				str: parseInt(lv * 201.0 / 1000),
				mz: lv * 1,
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "弹指惊雷",
			distime: 20000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 30,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N拇指扣住中指，真气凝聚——「弹指惊雷」！一道凌厉无比的指风破空弹出，如惊雷炸响！</HIY>", target);
				if (me.do_attack({
					target: target,
					gj: me.gj * 2,
					mz: me.mz,
				})) {
					target.add_mp(-4000);
					me.send_room("<HIR>$n被弹指惊雷击中，内力大损！</HIR>", target);
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "对敌人造成200%攻击力的伤害，命中后减少对方4000的内力。弹指惊雷，气吞山河。";
			}
		},
		pfm2: {
			name: "点穴",
			distime: 30000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 30,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N运起弹指神通——「点穴」！一指弹出，劲风直射$n要穴！</HIY>", target);
				if (me.do_attack({
					target: target,
					gj: me.gj * 2,
					mz: me.mz,
				})) {
					target.add_status({
						id: "busy",
						name: "忙乱",
						desc: "被点穴所制，无法行动",
						is_busy: true,
						duration: Math.min(5000 + parseInt(lv * 5), 10000),
						downside: true,
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "弹指神通之点穴大法，命中后造成伤害，并使敌人忙乱" + (Math.min(5000 + parseInt(lv * 5), 10000) / 1000) + "秒。弹指之间，穴道封绝。";
			}
		}
	};
