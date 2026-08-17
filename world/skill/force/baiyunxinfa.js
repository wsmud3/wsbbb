this.inherits(SKILL);
this.name = "白云心法";
this.id = "baiyunxinfa";
this.grade = 3;
this.force_rad = 0.75;
this.desc = "恒山派的内功心法。";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["force"];
this.learn_condition = {
		skill: { force: 300 }
	};

this.query_enable_prop = function (lv) {
		return {
			force: {
				gj: parseInt(lv * 1.3) + 10,
				fy: parseInt(lv * 1.3) + 10,
				max_hp: lv * 10,
				limit_mp: lv * 100,
				desc: "唯一：将你内力的75%转化为气血",
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "白云",
			distime: 60000,
			enable_skill: "force",
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIW>$N默运白云心法，一股柔和的内力如白云般笼罩全身——「白云」！$N周身白气氤氲，攻防之力在白云加持下节节攀升！</HIW>", me);
				me.add_status({
					id: "baiyun",
					name: "白云",
					desc: "攻击和防御增加" + (10 + parseInt(lv / 100)) + "%",
					duration: 20000 + parseInt(lv * 10),
					prop: { gj_per: 10 + parseInt(lv / 100), fy_per: 10 + parseInt(lv / 100) },
				})},
			query_desc: function (me, lv) {
				return "使用白云心法提升战力，增加你" + (10 + parseInt(lv / 100)) + "%的攻击，防御，持续" + (20 + parseInt(lv * 10 / 1000)) + "秒";
			}
		}
	};
