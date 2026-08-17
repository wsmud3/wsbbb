this.inherits(SKILL);
this.name = "云龙心法";
this.id = "yunlongxinfa";
this.grade = 1;
this.force_rad = 0.55;
this.desc = "天地会的内功心法，入会便能修炼";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["force"];

this.query_enable_prop = function (lv) {
		return {
			force: {
				gj: lv * 1,
				limit_mp: lv * 10,
				desc: "唯一：将你内力的55%转化为气血",
			},
		}
	}

this.pfm = {
		pfm1: {
			name: "云龙决",
			distime: 30000,
			enable_skill: "force",
			mp: 15,
			use: function (me, target, lv) {
				me.send_room("<HIW>$N气沉丹田，云龙心法运转——「云龙决」！一股真气如云龙般自$N体内升腾而起，攻击力顿时大增！</HIW>", me);
				me.add_status({
					id: "yunlong",
					name: "云龙",
					desc: "攻击增加1000点",
					duration: 10000 + parseInt(lv * 10),
					prop: { gj: 1000 },
				})},
			query_desc: function (me, lv) {
				return "提升全身潜力，在20秒内，提升自身攻击力1000点。";
			}
		}
	};
;

this.on_learn = function (me) {
		if (me.query_skill("force", 1) < 30)
		return me.notify_fail("你的基础内功级别不够，无法学习云龙心法。");
		return true;
	}
