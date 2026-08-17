	this.inherits(SKILL);
	this.name = "衡山五神剑";
	this.id = "hengshanwushenjian";
	this.grade = 3;
	this.desc = "衡山派绝学，一剑化五，分别对应五岳神峰——祝融、石廪、芙蓉、鹤翔、天柱，五剑齐出，鬼神难挡";
	this.can_enables = ["sword", "parry"];
	this.attack_actions = [
		"$N五神剑出手，剑气纵横，五招连环攻向$n",
		"$N长啸一声，衡山五神剑的剑意如潮水般涌向$n",
		"$N剑势如虹，五道剑光同时迸发，直取$n要害",
		"$N催动内劲，$w幻出祝融之威，剑身赤光流转，如烈焰焚天般劈向$n的$l",
		"$N身形一展，衡山五神剑化作一道苍翠剑芒，如石廪峰般沉稳厚重地压向$n",
		"$N剑势转柔，$w轻灵翔动，宛若芙蓉出水、鹤翔九天，剑尖飘忽不定地点向$n",
		"$N剑招陡变，$w如天柱峰般巍然屹立，一股磅礴剑气自剑尖涌出，直贯$n胸口",
		"$N五指连弹$w，五色剑光交相辉映——祝融赤、石廪青、芙蓉白、鹤翔蓝、天柱金——五神剑气同时斩向$n"
	];
	this.parry_actions = [
		"$n将$w一横，五神剑意化作一道无形屏障，$N的攻势撞在上面，竟如击在五岳山壁之上",
		"$n剑尖接连点出五下，五道剑气在身前织成剑网，将$N的$w牢牢挡在外围",
		"$n施展衡山剑意，$w化作五峰连绵之势，$N的杀招被层层剑影尽数消解",
		"$n长身而起，$w凌空划出五道光弧，如五座神峰从天而降，$N的攻势登时土崩瓦解",
		"$n神色凛然，$w回旋之间隐隐现出五岳虚影，$N只觉眼前一花，手中$w已被荡开"
	];
	this.learn_condition = {
		skill: { sword: 300 }
	};
	this.query_enable_prop = function (lv) {
		return {
		sword: {
			gj: parseInt(lv * 1.5) + 10,
			str: parseInt(lv * 168.0 / 1000),
			mz: parseInt(lv * 1.5) + 10,
		},
		parry: {
			zj: parseInt(lv * 1.3) + 10,
			str: parseInt(lv * 127.0 / 1000),
			diff_sh_per: 3,
		},
	};
	}
	// 装备招架时弹出五神赋增益选择按钮
	this.on_enable = function (me, type) {
		if (type === "parry" && me.is_player) {
		me.notify("请选择五神赋的增益类型：");
		me.send_commands(
			"wushenfu_sel zhurong", "祝融",
			"wushenfu_sel shilin", "石廪",
			"wushenfu_sel furong", "芙蓉",
			"wushenfu_sel hexiang", "鹤翔",
			"wushenfu_sel tianzhu", "天柱"
		);
	}
	};

	this.pfm = {
		wushenjian: {
		name: "五神剑",
		distime: 13000,
		enable_skill: "sword",
		release_time: 4000,
		mp: 25,
		use: function (me, target, lv) {
			me.send_room("<HIY>$N神色陡然一凛，手中$w横空而出——「五神剑」！霎时间，$w上迸发出五色剑光，分呈赤、青、白、蓝、金五色，分别对应祝融、石廪、芙蓉、鹤翔、天柱五岳神峰！五道剑光犹如五条游龙，撕裂长空，从五个方向同时斩向$n，剑气纵横之下，仿佛天地间只剩这五道夺命的剑光！</HIY>", target);
			for (var i = 0; i < 5; i++) {
				me.do_attack({
					target: target,
					gj: me.gj * 1.2,
				});
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "瞬间对敌人攻击5次，每次造成120%伤害。";
		}
	},
		wushenfu: {
		name: "五神赋",
		distime: 30000,
		enable_skill: "parry",
		release_time: 4000,
		mp: 25,
		use: function (me, target, lv) {
			var choices = {
				zhurong: { prop: {gj_per: 20 + parseInt(lv / 100)}, name: "祝融", stat: "攻击" },
				shilin:  { prop: {fy_per: 20 + parseInt(lv / 100)}, name: "石廪", stat: "防御" },
				furong:  { prop: {mz_per: 20 + parseInt(lv / 100)}, name: "芙蓉", stat: "命中" },
				hexiang: { prop: {ds_per: 20 + parseInt(lv / 100)}, name: "鹤翔", stat: "躲闪" },
				tianzhu: { prop: {zj_per: 20 + parseInt(lv / 100)}, name: "天柱", stat: "招架" },
			};
			var choice = me.query_temp("wushenfu_choice") || "zhurong";
			var info = choices[choice] || choices.zhurong;
			var per = 20 + parseInt(lv / 100);
			var dur = 10000 + lv * 10;
			me.send_room("<HIM>$N默诵五神赋口诀——「五神赋•" + info.name + "」！" + info.name + "峰神力加身，$N的" + info.stat + "之力暴涨" + per + "%！</HIM>", me);
			me.add_status({
				id: "wushenfu",
				name: info.name,
				desc: info.stat + "增加" + per + "%",
				duration: dur,
				prop: info.prop,
			});
		},
		query_desc: function (me, lv) {
			var per = 20 + parseInt(lv / 100);
			var dur_sec = (10000 + lv * 10) / 1000;
			return "召唤祝融，石廪，芙蓉，鹤翔，天柱之一，"+ dur_sec + "秒内随机增加你的某项战斗属性" + per + "%" ;
		}
	},
	};
