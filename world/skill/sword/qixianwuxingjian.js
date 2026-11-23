	this.inherits(SKILL);
	this.name = "七弦无形剑";
	this.id = "qixianwuxingjian";
	this.grade = 4;
	this.is_public = true;
	this.attack_actions = [
		"$N拨动$w，七弦无形剑发出一阵「嗡」鸣，无形音波直袭$n的$l",
		"$N剑身一震，七弦无形剑化作一道流光，挟着摄人心魄的音律刺向$n",
		"$N五指轻拂剑身，七弦无形剑发出宫商角徵羽之音，音波层层叠叠涌向$n",
		"$N以剑气为弦，弹奏出杀伐之音，七弦无形剑笼罩$n全身",
		"$N剑走偏锋，七弦无形剑忽作龙吟，无形剑气直贯$n双耳",
		"$N手中$w轻颤，七弦无形剑发出金铁交鸣之声，震得$n心神恍惚",
		"$N催动内力，七弦无形剑发出清越之音，剑势如琴音般连绵不绝刺向$n",
		"$N竟将$w横于胸前作抚琴之态，十指虚弹，无形剑气化作漫天音刃朝$n激射而去",
		"$N剑锋一转，七弦无形剑发出黄钟大吕之音，浑厚音波如巨锤般撞向$n胸口"
	];
	this.parry_actions = [
		"$n横剑当胸，五指轻弹剑脊，发出一阵清越琴音，$N的攻势竟被音波震得偏离了方向",
		"$n剑身微颤，七弦之音化作一道无形气墙，$N的$w刺到半途便如陷泥沼",
		"$n手指连弹$w，发出密如雨点的铮铮之音，将$N的杀招尽数消解于无形",
		"$n长笑一声，$w划出一道光弧，剑鸣之声令$N心神一滞，攻势登时缓了下来",
		"$n以剑气激荡$w，嗡鸣声化作无形屏障，$N只觉耳中嗡响，招式再难递进半分"
	];
	this.desc = "梅庄大庄主黄钟公所创绝技，以琴音为剑，无形无质却暗藏杀机，可伤人于无形之中";
	this.can_enables = ["sword"];
	this.learn_condition = {
		max_mp: 5000,
		skill: {
			sword: 500
		}
	};
	// 1000 级：攻击 +1320 命中 +1620 身法 +108；唯一：攻击时有概率打出音波伤人
	this.query_enable_prop = function (lv) {
		return {
			sword: {
				gj: parseInt(lv * 1.3) + 20,
				mz: parseInt(lv * 1.6) + 20,
				dex: parseInt(lv * 108 / 1000),
				desc: "唯一：攻击时有概率打出音波伤人"
			}
		};
	};
	// 音波：剑法攻击命中后 20% 概率追加一道音波，造成 50% 攻击力的伤害（不可闪避招架）
	var YINBO_RATE = 20, YINBO_GJ = 0.5;
	this.on_attack_over = function (me, target, par, sh) {
		if (!target || target === me || target.hp <= 0 || !(sh > 0) || (par && (par.is_dodge || par.is_parry || par.is_counter))) return;
		if (Math.random() * 100 >= YINBO_RATE) return;
		var dealt = target.damage(Math.floor(me.gj * YINBO_GJ), me);
		if (dealt > 0) me.send_combat("<HIC>剑鸣铮然，一道无形音波随之而至，" + target.name + "受到了" + dealt + "点伤害！</HIC>\n", target);
	};
	this.pfm = {
		qijueyin: {
			name: "七绝音",
			distime: 36000,
			enable_skill: "sword",
			release_time: 4000,
			mp: 54,
			use: function (me, target, lv) {
				me.send_room("<HIC>$N以$w代琴，指尖连拨，七道无形弦音直取$n心脉——「七绝音」！</HIC>", target);
				for (var i = 0; i < 7; i++) {
					if (target.hp <= 0 || me.hp <= 0) break;
					me.do_attack({ target: target, gj: me.gj, mz: me.mz, attack_msg: "", no_append: true });
				}
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "发出七道弦音攻击目标心脉。";
			}
		},
		moyin: {
			name: "魔音贯耳",
			distime: 47000,
			enable_skill: "sword",
			release_time: 4000,
			mp: 72,
			use: function (me, target, lv) {
				var par = { target: target, gj: me.gj, mz: me.mz,
					attack_msg: "<HIM>$N剑锋一颤，一缕魔音直贯$n双耳，侵入心脉——「魔音贯耳」！</HIM>" };
				var hit = me.do_attack(par);
				if (par.is_dodge || par.is_parry) hit = 0;
				if (hit > 0 && target.hp > 0) {
					target.add_status({
						id: "qixian_moyin",
						name: "魔音贯耳",
						desc: "防御、躲闪降低30%",
						duration: 12000,
						only_combat: true,
						downside: true,
						override: 2,
						prop: { fy_per: -30, ds_per: -30 },
						start_msg: "<HIM>$N被魔音侵入心脉，心神大乱！</HIM>",
						finish_msg: "$N渐渐摆脱了魔音的侵扰。",
					}, me);
				}
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "以魔音侵入目标心脉，命中后使其防御躲闪降低30%，持续12秒。";
			}
		}
	};
