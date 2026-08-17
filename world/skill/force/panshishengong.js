this.inherits(SKILL);
this.name = "磐石神功";
this.id = "panshishengong";
this.grade = 3;
this.force_rad = 0.75;
this.desc = "泰山派的内功心法";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["force"];
this.learn_condition = {
		max_mp: 3000,
		skill: { force: 300 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				fy: parseInt(lv * 1.7) + 20,
				max_hp: parseInt(lv * 8100.0 / 1000),
				con: parseInt(lv * 144.0 / 1000),
				limit_mp: lv * 100,
				desc: "唯一：将你内力的75%转化为气血",
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "磐石决",
			distime: 60000,
			enable_skill: "force",
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N沉腰坐马，内力凝聚如磐石——「磐石决」！$N周身真气凝实，如泰山磐石般坚不可摧！</HIY>", me);
				me.add_status({
					id: "panshi",
					name: "磐石",
					desc: "防御增加" + (90 + parseInt(lv / 100)) + "%",
					duration: 5000 + parseInt(lv * 10),
					prop: { fy_per: 90 + parseInt(lv / 100) },
				})},
			query_desc: function (me, lv) {
				return "在" + (5 + parseInt(lv * 10 / 1000)) + "秒内，提升自身防御" + (90 + parseInt(lv / 100)) + "%。";
			}
		}
	};
