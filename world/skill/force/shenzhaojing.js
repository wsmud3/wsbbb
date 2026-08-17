this.inherits(SKILL);
this.name = "神照经";
this.id = "shenzhaojing";
this.grade = 4;
this.force_rad = 0.8;
this.desc = "连城诀中至高无上的内功心法，可起死回生";
this.can_enables = ["force", "unarmed"];
this.learn_condition = {
		max_mp: 4000,
		skill: { force: 400 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				str: parseInt(lv * 176.0 / 1000),
				con: parseInt(lv * 176.0 / 1000),
				dex: parseInt(lv * 176.0 / 1000),
				int: parseInt(lv * 176.0 / 1000),
				limit_mp: lv * 150,
				desc: "唯一：将你内力的80%转化为气血",
			},
			unarmed: {
				gj: parseInt(lv * 1.7) + 0,
				mz: parseInt(lv * 1.7) + 0,
				str: parseInt(lv * 210.0 / 1000),
				con: parseInt(lv * 210.0 / 1000),
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "神照",
			distime: 60000,
			enable_skill: "force",
			mp: 30,
			use: function (me, target, lv) {
				var bonus = Math.floor(lv * 210 / 1000);
				me.send_room("<HIY>$N盘膝而坐，神照经内力如江河奔涌——「神照」！一道璀璨金光自九天照落，$N筋骨愈发强韧，神力贯体！</HIY>", me);
				me.add_status({
					id: "shenzhao",
					name: "神照",
					desc: "根骨、臂力、身法增加" + bonus + "点",
					duration: 20000 + parseInt(lv * 10),
					prop: { str: bonus, con: bonus, dex: bonus },
				})},
			query_desc: function (me, lv) {
				return "神照——在" + (20 + parseInt(lv * 10 / 1000)) + "秒内增加你" + (Math.floor(lv * 210 / 1000)) + "点根骨、臂力、身法。";
			}
		},
		pfm2: {
			name: "拳经",
			distime: 10000,
			enable_skill: "force",
			mp: 30,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N沉腰坐马，右拳紧握——「拳经」！神照经内力如江河般涌入手臂，一拳击出带着至刚至猛的浩然正气轰向$n！</HIY>", target);
				if (me.do_attack({
					target: target,
					gj: Math.floor(me.gj * (6 + Math.floor(me.query_prop("str") / 100)) / 100),
					mz: me.mz,
				})) {
					me.add_status({
						id: "quanjing",
						name: "拳经盾",
						desc: "吸收1392点伤害",
						duration: 5000 + parseInt(lv * 10),
						prop: { absorb_sh: 1392 },
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "拳经——一式直拳对敌人造成伤害，造成6%攻击力的伤害，你臂力越高造成的伤害越大，命中后给自己增加一个吸收1392伤害的护盾，护盾期间拳经冷却减少。";
			}
		}
	};
