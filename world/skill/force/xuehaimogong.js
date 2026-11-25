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
					// 不会死亡：借引擎的 min_hp 锁血（add_hp 最多扣到 min_hp），结束时恢复原值
					on_attach: function (who) {
						if (who._xueji_min_hp === undefined) who._xueji_min_hp = who.min_hp || 0;
						if (!(who.min_hp >= 1)) who.min_hp = 1;
					},
					on_expire: function(who) {
						if (who._xueji_min_hp !== undefined) {
							who.min_hp = who._xueji_min_hp;
							delete who._xueji_min_hp;
						}
						// 虚弱：与火舞旋风·天地同寿的虚弱同一个 id、同样的属性（-90%），但固定 30 秒，不受负面抵抗影响、不可驱散
						who.add_status({
							id: "xuruo",
							name: "虚弱",
							desc: "攻击、命中、防御、躲闪、招架降低90%",
							duration: 30000,
							downside: true,
							no_diff: true,
							no_clear: true,
							prop: { gj_per: -90, mz_per: -90, fy_per: -90, ds_per: -90, zj_per: -90 },
							start_msg: "<HIB>$N气血两亏，变得十分虚弱。</HIB>",
							finish_msg: "$N渐渐从虚弱中恢复过来。",
						});
					},
				})},
			query_desc: function (me, lv) {
				return "血祭——消耗你25%的最大气血，在" + (4 + parseInt(lv * 5 / 1000)) + "秒内增加你" + (10 + parseInt(lv / 100)) + "%的战斗属性，并且不会死亡，效果结束后陷入虚弱30秒：攻击、命中、防御、躲闪、招架降低90%。";
			}
		}
	};
