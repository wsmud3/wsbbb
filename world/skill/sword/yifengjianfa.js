	this.inherits(SKILL);
	this.name = "移风剑法";
	this.id = "yifengjianfa";
	this.grade = 3;
	this.attack_actions = [
			"$N移风剑法飘逸灵动，剑未至，剑气已迫人而来",
			"$N剑光流转，如清风拂面，实则暗藏杀机，刺向$n的$l",
			"$N身形一转，$w如旋风般扫出，移风剑法变幻无方，直取$n的$l",
			"$N剑势飘忽，如微风拂柳，$w看似轻柔却暗含杀机刺向$n",
			"$N剑招忽快忽慢，移风剑意运转自如，$w化作一片剑影罩向$n",
			"$N足尖轻点，$w如风送浮萍般飘向$n，剑至半途陡然加速",
			"$N长袖一挥，$w借风势而出，移风剑法「风卷残云」直袭$n的$l",
			"$N剑走偏门，$w如穿花蝴蝶般绕到$n身侧，一剑封喉而来"
		];
	this.parry_actions = [
			"$n剑随身转，移风剑意流转，$w如风墙般护住周身",
			"$n手腕轻抖，$w化作一阵剑风，将$N的攻势吹偏方向",
			"$n身形如柳絮随风，$w顺势一带，$N的攻击被轻巧化解",
			"$n剑尖连点，$w如风中落叶般飘忽不定，$N找不到进击之机",
			"$n以移风剑诀护体，$w在身前舞出一片剑幕，$N的攻击尽被荡开"
		];
	this.desc = "移花宫剑法，剑招如风，变幻莫测";
	this.can_enables = ["sword"];
	this.learn_condition = {
			max_mp: 3000,
			skill: { sword: 300 }
		};

	this.query_enable_prop = function (lv) {
			return {
				sword: {
					gj: parseInt(lv * 1.3) + 20,
					mz: parseInt(lv * 1.1) + 20,
				},
			}
		}

	this.pfm = {
			pfm1: {
				name: "移风起栖",
				distime: 20000,
				enable_skill: "sword",
				release_time: 3096,
				mp: 20,
				use: function (me, target, lv) {
					me.send_room("<HIY>$N剑法如风——「移风起栖」！$w化作七道剑影，剑速之快令人目眩，$n只见剑光不见剑！</HIY>", target);
					for (var i = 0; i < 7; i++) {
						me.do_attack({
							target: target,
							gj: me.gj,
							mz: Math.floor(me.mz * 2),
						});
					}
					me.end_attack(target)
				},
				query_desc: function (me, lv) {
					return "瞬间内对敌人快速攻击7次，攻击中命中增加100%";
				}
			}
		};
