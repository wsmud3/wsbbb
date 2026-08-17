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
	this.desc = "梅庄黄钟公所创的奇门剑法，以剑为琴，以音伤人，无形无影，防不胜防";
	this.can_enables = ["sword", "parry"];
	this.learn_condition = {
		max_mp: 5000,
		skill: {
			sword: 500
		}
	};
	this.query_enable_prop = function (lv) {
		return {
			sword: {
				gj: lv * 2 + 15,
				mz: lv * 1.5 + 20,
				gjsd: 200
			},
			parry: {
				zj: parseInt(lv * 2310 / 1000),
				diff_sh_per: 4,
				int: parseInt(lv * 127.0 / 1000),
			}
		};
	}
	this.pfm = {
		huangzhongdalu: {
			name: "黄钟大吕",
			distime: 30000,
			enable_skill: "sword",
			release_time: 3600,
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N神色肃穆，将$w高举过顶，内力灌注剑身——「黄钟大吕」！刹那间，$w发出一声震天动地的宏亮剑鸣，犹如古刹钟声，无形的音波化作实质的涟漪，以$N为中心向四周狂涌而出，$n身处其中，只觉五脏六腑都被这黄钟大吕之音震得翻腾不已！</HIY>", target);
				me.do_attack({target: target, gj: me.gj * 1.8});
				target.add_status({
					id: "huangzhong_xuanyun",
					name: "眩晕",
					desc: "被黄钟大吕震得头晕目眩，命中降低",
					duration: 5000 + parseInt(lv * 5),
					only_combat: true,
					downside: true,
					override: 2,
					prop: {
						mz_per: -(20 + parseInt(lv / 100)),
						ds_per: -(10 + parseInt(lv / 100)),
					},
					start_msg: "<HIY>$n被那宏大无匹的钟吕之音震得耳中嗡鸣不止，眼前金星乱冒，一时间头重脚轻！</HIY>",
					finish_msg: "$n耳中的嗡鸣渐渐消散，恢复了清醒。",
				}, me);
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "以剑作钟，发出震天动地的黄钟大吕之音，对敌人造成180%伤害，并使其命中降低" + (20 + parseInt(lv / 100)) + "%、躲闪降低" + (10 + parseInt(lv / 100)) + "%，持续" + (5 + parseInt(lv * 5 / 1000)) + "秒。";
			}
		}
	};
