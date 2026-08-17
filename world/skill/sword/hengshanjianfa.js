	this.inherits(SKILL);
	this.name = "恒山剑法";
	this.id = "hengshanjianfa";
	this.grade = 3;
	this.attack_actions = [
		"$N恒山剑法展开，绵密严谨，剑气笼罩$n全身",
		"$N剑光霍霍，一招快似一招，正是恒山派的绵里藏针",
		"$N手中长剑挥洒自如，剑招如行云流水般刺向$n",
		"$N剑圈一引，恒山剑法圆转如意，看似平和却暗藏杀机，直取$n的$l",
		"$N身形如白云出岫，剑锋轻灵飘逸，每一剑都不离$n要害半分",
		"$N剑势忽然收敛，长剑如织布机上的梭子，绵密剑网将$n困在当中",
		"$N手腕一抖，$w挽出七朵剑花，如恒山云雾般向$n涌去",
		"$N面露慈悲之色，手中$w却毫不容情，恒山剑法守中有攻，一剑递出便是连绵不绝的后着"
		];
	this.parry_actions = [
		"$n手中$w划出一道圆弧，恒山剑法的绵密守势展开，$N的攻势如石沉大海",
		"$n剑走轻灵，$w轻描淡写地一拨，$N的凌厉杀招便被带偏了方向",
		"$n不慌不忙，恒山剑法本就以守御见长，$w连消带打，将$N的攻势尽数封住",
		"$n脚步微错，$w在身前织出一道剑网，$N的$w刺来，竟如泥牛入海，再难寸进",
		"$n面露微笑，$w看似缓慢实则精准无比地搭上$N的$w，轻轻一引便将杀招化解于无形"
		];
	this.desc = "恒山派剑法，以绵密防守著称";
	this.can_enables = ["sword", "parry"];
	this.learn_condition = {
		skill: { sword: 300 }
		};

	this.query_enable_prop = function (lv) {
		return {
				sword: {
					gj: lv * 1 + 20,
					mz: parseInt(lv * 170.0 / 1000),
				},
			}
		}

	this.pfm = {
		pfm1: {
				name: "流云七剑",
				distime: 20000,
				enable_skill: "sword",
				release_time: 3096,
				mp: 25,
				use: function (me, target, lv) {
					me.send_room("<HIC>$N剑势如流云般连绵不绝——「流云七剑」！$w轻灵飘逸，七道剑光如行云流水般依次递出，$n被这绵绵剑意笼罩其中！</HIC>", target);
					for (var i = 0; i < 7; i++) {
						me.do_attack({
							target: target,
							gj: Math.floor(me.gj * 63 / 100),
							mz: me.mz,
						});
					}
					me.end_attack(target)
				},
				query_desc: function (me, lv) {
					return "行云流水般连出七招，每招造成你攻击力63%的伤害";
				}
			},
		pfm2: {
				name: "绵里藏针",
				distime: 15000,
				enable_skill: "sword",
				release_time: 3096,
				mp: 25,
				use: function (me, target, lv) {
					me.send_room("<HIC>$N剑势看似轻柔无力——「绵里藏针」！$w如棉絮般飘向$n，却在触及的刹那暴起锋芒！</HIC>", target);
					if (me.do_attack({
						target: target,
						gj: me.gj,
						mz: me.mz,
					})) {
					} else {
						me.do_attack({
							target: target,
							gj: Math.floor(me.gj * 266 / 100),
							mz: Math.floor(me.mz * 266 / 100),
						});
					}
					me.end_attack(target)
				},
				query_desc: function (me, lv) {
					return "先手示弱对敌人造成83%的伤害，如果未命中，后手会增加你166%的伤害和命中";
				}
			}
		};
