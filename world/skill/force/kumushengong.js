this.inherits(SKILL);
this.name = "枯木神功";
this.id = "kumushengong";
this.grade = 4;
this.force_rad = 0.8;
this.desc = "大理枯荣禅寺绝学，内力如枯木般深沉内敛";
this.can_enables = ["force"];
this.learn_condition = {
		max_mp: 3000,
		skill: { force: 300 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				max_hp: lv * 10,
				fy: lv * 2,
				limit_mp: lv * 100,
				desc: "唯一：将你内力的80%转化为气血",
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "枯木逢春",
			distime: 60000,
			enable_skill: "force",
			mp: 30,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N双手合十，面如枯木——「枯木逢春」！体内真气在寂静中轰然流转，$N周身枯寂之气一扫而空，如枯木逢春雨、朽木发新芽，生机勃发！</HIG>", me);
				// 清除自身负面状态
				var toRemove = [];
				if (me.status) {
					for (var j = 0; j < me.status.length; j++) {
						if (me.status[j].downside) toRemove.push(me.status[j].id);
					}
					for (var k = 0; k < toRemove.length; k++) {
						me.remove_status(toRemove[k]);
					}
				}
				me.add_status({
					id: "kumu",
					name: "枯木",
					desc: "气血增加20%",
					duration: 20000 + parseInt(lv * 10),
					prop: { hp_per: 20 },
				})},
			query_desc: function (me, lv) {
				return "枯木逢春——增加你20%气血，移除你自身的负面状态。";
			}
		}
	};
