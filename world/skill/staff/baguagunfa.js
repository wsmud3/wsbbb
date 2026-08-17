	this.inherits(SKILL);
	this.name = "八卦棍法";
	this.id = "baguagunfa";
	this.grade = 3;
	this.is_public = true;
	this.attack_actions = [
		"$N手中棍棒一抖，八卦棍法乾位出击，直取$n的$l",
		"$N脚踏八卦方位，手中棍棒如旋风般扫向$n",
		"$N步踏坤位，$w沉稳如山，一棍横扫$n的下盘",
		"$N身形一转，八卦棍法震位出击，$w如雷霆万钧砸向$n的$l",
		"$N脚踏巽位，$w如风般迅疾，转瞬之间已刺至$n的$l",
		"$N步法连变，坎离交济，$w化作漫天棍影笼向$n",
		"$N抢占艮位，$w如山岳般沉重，一棍劈下势不可挡",
		"$N八卦方位踏遍，$w从兑位奇袭而出，$n防不胜防"
	];
	this.parry_actions = [
		"$n脚踏八卦，$w随方位转动，在身前布下棍阵护住周身",
		"$n棍势如环，$w以八卦圆转之力将$N的攻击卸到一旁",
		"$n步法灵动，$w随方位变换，$N的攻势尽数落在空处",
		"$n抢占中宫，$w化作一道棍墙，$N竟找不到进击之隙",
		"$n以八卦棍意护体，$w在周身舞出一片棍幕，$N的攻击尽被弹回"
	];
	this.desc = "温府的一套棍法，以八卦方位演化，招招连环，防不胜防";
	this.can_enables = ["staff", "parry"];
	this.learn_condition = {
		max_mp: 2000,
		skill: { staff: 200 }
	};

	this.query_enable_prop = function (lv) {
		return {
			staff: {
				gj: Math.floor(1.2 * lv + 10),
				mz: Math.floor(1.2 * lv + 10),
			},
		}
	}

	this.pfm = {
		pfm1: {
			name: "八卦八打",
			distime: 20000,
			enable_skill: "staff",
			release_time: 0,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N脚踏八卦方位，手中$W棍影翻飞——「八卦八打」！刹那间乾、坤、震、巽、坎、离、艮、兑八方位各出一棍，八道棍影如雷霆般同时砸向$n，$n只觉四面八方尽是棍影，避无可避！</HIY>", target);
				for (var i = 0; i < 8; i++) {
					me.do_attack({
						target: target,
						gj: me.gj,
						mz: me.mz,
					});
				}
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "瞬间对敌人攻击8次";
			}
		}
	};
