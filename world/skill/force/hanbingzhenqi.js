this.inherits(SKILL);
this.name = "寒冰真气";
this.id = "hanbingzhenqi";
this.grade = 4;
this.force_rad = 0.7;
this.desc = "嵩山派独门内功，真气至阴至寒，可冻结对手经脉";
this.can_enables = ["force"];
this.learn_condition = {
		max_mp: 4000,
		skill: { force: 400 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				max_hp: lv * 20,
				limit_mp: lv * 145,
				desc: "唯一：将你内力的70%转化为气血",
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "寒冰",
			distime: 40000,
			enable_skill: "force",
			mp: 30,
			use: function (me, target, lv) {
				me.send_room("<HIB>$N面色一沉，默运寒冰真气——「寒冰诀」！一股刺骨寒气自$N周身弥漫开来，空气为之凝结，地面覆上薄霜。$N的伤害附上了至寒之力！</HIB>", me);
				me.add_status({
					id: "hanbing",
					name: "寒冰",
					desc: "伤害附加4000寒冰伤害，攻击者将被减速35%",
					duration: 10000 + parseInt(lv * 10),
					prop: { add_sh: 4000 },
					start_msg: "<HIB>$N周身寒气大盛，水汽凝结成霜！</HIB>",
					finish_msg: "$N周身的寒气渐渐消散。",
				})},
			query_desc: function (me, lv) {
				return "寒冰诀——在" + (10 + parseInt(lv * 10 / 1000)) + "秒内，你的伤害附加4000寒冰伤害，周身寒气化为冰甲护体，攻击你的敌人将被冻结血脉，在15秒内减慢35%攻击速度。";
			}
		}
	};
