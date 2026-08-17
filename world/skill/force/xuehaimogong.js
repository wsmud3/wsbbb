this.inherits(SKILL);
this.name = "血海魔功";
this.id = "xuehaimogong";
this.grade = 4;
this.force_rad = 0.75;
this.desc = "血刀门邪功，以血练功，凶残至极";
this.can_enables = ["force"];
this.learn_condition = {
		max_mp: 4000,
		skill: { force: 400 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				gj: parseInt(lv * 1.6) + 12,
				fy: parseInt(lv * 1.7) + 80,
				diff_fy_per: 11,
				limit_mp: lv * 140,
				desc: "唯一：将你内力的75%转化为气血",
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "血祭",
			distime: 60000,
			enable_skill: "force",
			mp: 30,
			use: function (me, target, lv) {
				var cost = Math.floor(me.max_hp * 0.25);
				me.from_attack(cost, 0, null, "");
				me.send_room("<HIR>$N仰天长啸，眼中血光大盛——「血祭」！$N以自身精血为引，周身毛孔渗出丝丝血雾，整个人化为浴血修罗，凶威滔天！</HIR>", me);
				me.add_status({
					id: "xueji",
					name: "血祭",
					desc: "战斗属性增加" + (10 + parseInt(lv / 100)) + "%，不会死亡",
					duration: 4000 + parseInt(lv * 5),
					prop: { gj_per: 10 + parseInt(lv / 100), fy_per: 10 + parseInt(lv / 100), mz_per: 10 + parseInt(lv / 100), ds_per: 10 + parseInt(lv / 100), zj_per: 10 + parseInt(lv / 100) },
					on_expire: function(who) {
						who.add_status({
							id: "xueji_p",
							name: "血虚",
							desc: "战斗属性减少" + (30 + parseInt(lv / 100)) + "%",
							duration: 21000,
							downside: true,
							no_diff: true,
							prop: { gj_per: -(30 + parseInt(lv / 100)), fy_per: -(30 + parseInt(lv / 100)), mz_per: -(30 + parseInt(lv / 100)), ds_per: -(30 + parseInt(lv / 100)), zj_per: -(30 + parseInt(lv / 100)) },
						});
					},
				})},
			query_desc: function (me, lv) {
				return "血祭——消耗你25%的最大气血，在" + (4 + parseInt(lv * 5 / 1000)) + "秒内增加你" + (10 + parseInt(lv / 100)) + "%的战斗属性，并且不会死亡，效果结束后21秒内自身减少" + (30 + parseInt(lv / 100)) + "%战斗属性。";
			}
		}
	};
