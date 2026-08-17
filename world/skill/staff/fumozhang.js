	this.inherits(SKILL);
	this.name = "伏魔杖";
	this.id = "fumozhang";
	this.grade = 5;
	this.desc = "净念禅宗嫡传杖法，以金刚伏魔之力降服外道，杖出如龙，横扫千军。";
	this.can_enables = ["staff", "parry"];
	this.attack_actions = [
		"$N杖出如龙，金刚伏魔之力横扫而来，砸向$n的$l",
		"$N手中禅杖一振，伏魔杖法展开，杖影如山压向$n",
		"$N大喝一声，伏魔杖带着破空之声，直捣$n要害",
		"$N运起金刚伏魔神通，$w通体绽放金光，一杖挥出便有万钧之力，朝$n当头砸落",
		"$N手中$w横扫千军，杖风激荡之下砂石飞溅，$n被这股威势逼得气息为之一窒",
		"$N禅杖舞动如轮，$w化作一团金色光轮，带着降妖伏魔的浩然正气滚滚碾向$n",
		"$N猛然将$w往地上一顿，地面龟裂，一股无形巨力自杖端涌出，如怒涛般冲向$n",
		"$N口诵佛号，$w之上梵文流转，伏魔杖法施展到极致，一杖击出竟似有罗汉法相随行，威不可挡"
	];
	this.parry_actions = [
		"$n将$w横架当空，金刚伏魔之力化作一道金色屏障，$N的攻势撞在上面如击铁壁",
		"$n禅杖一振，$w发出洪钟般的嗡鸣，一股浑厚佛力将$N的$w震得高高弹起",
		"$n杖法沉稳如山，$w在身前缓缓转动，如佛门金刚护法般将周身守得固若金汤",
		"$n不避不让，$w猛力向外一封，金刚伏魔的反震之力将$N的攻势硬生生砸了回去",
		"$n口中默诵经文，$w杖影重重，化作一尊不动明王虚影，$N的杀招撞上虚影便烟消云散"
	];
	this.learn_condition = {
		max_mp: 8000,
		skill: { staff: 800 }
	};
	this.query_enable_prop = function (lv) {
		return {
			staff: {
				gj: parseInt(lv * 1810 / 1000),
				mz: parseInt(lv * 1810 / 1000),
				str: parseInt(lv * 343 / 1000),
				con: parseInt(lv * 343 / 1000),
			},
			parry: {
				zj: parseInt(lv * 2310 / 1000),
				con: parseInt(lv * 200.0 / 1000),
				str: parseInt(lv * 150.0 / 1000),
			},
		};
	};
	this.pfm = {
		pfm1: {
			name: "罗汉伏魔",
			distime: 20000,
			enable_skill: "staff",
			release_time: 3000,
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<hiy>$N将禅杖高举过顶，周身佛光骤然大盛，口中梵音如雷——「罗汉伏魔」！但见一尊金刚罗汉法相从$N身后浮现，宝相庄严，怒目圆睁！$N手中$w与罗汉法相的降魔杵合二为一，挟着无上佛门降魔之力，化作一道贯穿天地的金色光柱，轰然砸向$n！这一杖之威，足以令群魔辟易、万邪不侵！</hiy>", target);
				var stacks = (me.query_temp("luohan_stacks") || 0) + 1;
				if (stacks > 5) stacks = 5;
				me.set_temp("luohan_stacks", stacks);
				me.add_status({
					id: "luohan_fumo",
					name: "罗汉伏魔",
					desc: "罗汉伏魔" + stacks + "层，伤害+" + (stacks * 80) + "%",
					duration: 5000 + parseInt(lv * 10),
					downside: false,
					override: 1,
					prop: { gj_per: stacks * 80 },
					start_msg: "<hiy>$N周身金光大盛，罗汉之力灌注全身(" + stacks + "层)！</hiy>",
					finish_msg: "$N的罗汉伏魔之力消散了。",
					on_expire: function(p) { p.remove_temp("luohan_stacks"); },
				});
				me.do_attack({target: target});
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "每层增加80%伤害，最多叠加5层(400%)，持续" + (5 + parseInt(lv * 10 / 1000)) + "秒。";
			}
		}
	};
