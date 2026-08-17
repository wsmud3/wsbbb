	this.inherits(SKILL);
	this.name = "段家剑";
	this.id = "duanjiajian";
	this.grade = 3;
	this.desc = "段家剑";
	this.can_enables = ["sword", "parry"];
	this.attack_actions = [
		"$N剑走中正，段家剑法正气凛然，直刺$n的$l",
		"$N剑尖轻颤，一招「大江东去」，剑气如虹贯向$n",
		"$N手中长剑如游龙般刺出，$n只觉剑气扑面而来",
		"$N身形微侧，一招「碧鸡报晓」，$w自下而上斜挑$n的$l",
		"$N剑诀一引，段家剑「龙蛇起陆」，$w化作数道剑影分袭$n各处",
		"$N长啸一声，$w贯注内力，一招「金马腾空」直劈$n而去",
		"$N身随剑走，一招「苍山负雪」，剑气如大理苍山之雪，寒芒直透$n的$l",
		"$N剑势陡变，段家剑绝学「洱海月映」，$w化作一片清冷剑光笼罩$n"
	];
	this.parry_actions = [
		"$n剑身一横，段家剑守势如山，$w稳稳架住$N的来招",
		"$n手腕轻抖，$w划出一道光弧，将$N的攻击荡开一旁",
		"$n凝神静气，$w化作一道白光护住周身，$N的攻势尽数被挡在剑圈之外",
		"$n侧身避让，$w顺势斜引，以段家剑柔劲化解$N的凌厉一击",
		"$n脚踏中宫，$w横封竖挡，段家剑正气凛然，$N竟攻不进去"
	];
	this.learn_condition = {
		max_mp: 3000,
		skill: { sword: 300 }
	};
	this.query_enable_prop = function (lv) {
		return {
			sword: {
				gj: parseInt(lv * 1.5) + 10,
				mz: parseInt(lv * 1.6) + 10,
			},
			parry: {
				zj: parseInt(lv * 1.3) + 10,
				fy: parseInt(lv * 1.2) + 10,
			},
		};
	}
	this.pfm = {
		pfm1: {
			name: "一阳剑气",
			distime: 35000,
			enable_skill: "sword",
			release_time: 3096,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N催动一阳指内力贯注剑身——「一阳剑气」！$w上金光闪烁，剑上附着至刚至阳的纯阳真气，威力暴增！</HIY>", me);
				me.add_status({
					id: "yiyang_jq",
					name: "剑气",
					desc: "伤害增加" + (30 + parseInt(lv / 100)) + "%",
					duration: 100 + parseInt(lv * 10),
					prop: { gj_per: 30 + parseInt(lv / 100) },
				})},
			query_desc: function (me, lv) {
				return "将内力贯入武器，" + ((100 + parseInt(lv * 10)) / 1000) + "秒内增加伤害" + (30 + parseInt(lv / 100)) + "%";
			}
		},
		pfm2: {
			name: "剑气",
			distime: 35000,
			enable_skill: "sword",
			release_time: 3096,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIW>$N剑气纵横——「剑气」！$w上剑芒暴涨，这一剑蕴含了$N全部的精气神，命中大幅提升！</HIW>", target);
				me.do_attack({
					target: target,
					gj: me.gj,
					mz: Math.floor(me.mz * 2),
				});
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "将内力贯入武器，以剑气伤人，对敌方造成310%的伤害，命中增加100%";
			}
		}
	};
