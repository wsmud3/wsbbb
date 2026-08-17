this.inherits(SKILL);
this.name = "葵花神功";
this.id = "kuihuashengong";
this.grade = 5;
this.force_rad = 0.7;
this.desc = "源自葵花宝典的至高内功，修习后身法快如鬼魅，出手诡异莫测";
this.can_enables = ["force", "dodge"];
this.learn_condition = {
		max_mp: 5000,
		skill: { force: 500 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				gj: lv * 2 + 100,
				mz: lv * 2 + 10,
				limit_mp: lv * 280,
				desc: "唯一：将你内力的70%转化为气血",
			},
			dodge: {
				ds: lv * 2 + 12,
				dex: parseInt(lv * 200.0 / 1000),
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "鬼魅",
			distime: 30000,
			enable_skill: "force",
			allow_busy: true,
			mp: 35,
			use: function (me, target, lv) {
				me.send_room("<HIM>$N双目闪过一丝妖异红芒，葵花真气轰然运转——「鬼魅」！$N身影陡然变得虚幻难辨，如镜花水月般层层叠叠，所有负面状态一扫而空！</HIM>", me);
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
					id: "guimei",
					name: "鬼魅",
					desc: "无视控制技能",
					duration: 3000 + parseInt(lv * 10),
					prop: { ig_control: 1 },
				})},
			query_desc: function (me, lv) {
				return "鬼魅——使用后清除自身的负面状态，在" + (3 + parseInt(lv * 10 / 1000)) + "秒内无视控制技能，（忙乱可用）。";
			}
		}
	};
