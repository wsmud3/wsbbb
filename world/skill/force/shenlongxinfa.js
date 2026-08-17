this.inherits(SKILL);
this.name = "神龙心法";
this.id = "shenlongxinfa";
this.grade = 2;
this.force_rad = 0.7;
this.desc = "神龙教的心法，诡异无比";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["force"];
this.learn_condition = {
		max_mp: 2000,
		skill: { force: 200 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				max_hp: lv * 10,
				limit_mp: lv * 70,
				desc: "唯一：将你内力的70%转化为气血",
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "不死神龙",
			distime: 30000,
			enable_skill: "force",
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N口中念念有词，呼唤洪教主法力——「不死神龙」！一道神龙虚影盘绕$N周身，防御之力暴涨！</HIG>", me);
				me.add_status({
					id: "shenlong",
					name: "神龙",
					desc: "防御增加1000点",
					duration: 10000 + parseInt(lv * 10),
					prop: { fy: 1000 },
				})},
			query_desc: function (me, lv) {
				return "呼唤洪教主的法力，增加自身防御" + (10 + parseInt(lv * 10 / 1000)) + "秒内，提升自身防御1000点。";
			}
		}
	};
