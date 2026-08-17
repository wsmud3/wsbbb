this.inherits(SKILL);
this.name = "六脉神剑";
this.id = "liumaishenjian";
this.grade = 5;
this.is_public = true;
this.attack_actions = [
	"$N右手大拇指一捺，一招「少商剑」，剑气雄劲，石破天惊般刺向$n的$l",
	"$N食指一伸，使出一招「商阳剑」，剑气巧妙灵活，难以捉摸地射向$n",
	"$N中指一弹，一招「中冲剑」，剑气大开大阖，气势雄迈地刺向$n的$l",
	"$N无名指一拂，使出「关冲剑」，剑气拙滞古朴，缓缓推向$n",
	"$N右手小指一挑，一招「少冲剑」，剑气轻灵迅速，闪电般点向$n",
	"$N左手小指一伸，使出「少泽剑」，剑气忽来忽去，变化精微地袭向$n",
	"$N六脉齐出，六道剑气交织成网，将$n笼罩在一片剑光之中"
];
this.parry_actions = [
	"$n指尖轻弹，六脉神剑「少商护体」施出，一道雄劲剑气将$N的攻击凌空拦截",
	"$n食指虚点，一式「商阳御敌」从容施展，剑气巧妙灵动将$N的攻势引向一旁",
	"$n中指疾弹，六脉神剑「中冲破招」后发先至，大开大阖的剑气直贯$N攻势破绽",
	"$n五指连弹，一招「六脉齐御」施出，六道剑气在身前织成无形剑网拦下$N的攻击",
	"$n运剑于指，六脉神剑「剑气护身」守势运转，$N的猛攻被无形剑气一一击散"
];
this.desc = "大理段氏所藏有的超强剑气绝学，能够以指尖激荡出破体剑气伤人于无形";
this.can_enables = ["unarmed"];
this.learn_condition = {
	max_mp: 12000,
	skill: { unarmed: 1200 }
};

this.on_attack_over = function (me, target, par, sh) {
	// Passive splash: only when unarmed (bare hands or fist weapon)
	if (sh > 0 && me.enemy && me.enemy.length > 0 && me.query_weapon_type() === WEAPON_TYPE.NONE) {
		var nearby = null;
		if (me.enemy.length === 1) {
			nearby = me.enemy[0];
		} else {
			var others = [];
			for (var i = 0; i < me.enemy.length; i++) {
				if (me.enemy[i] && me.enemy[i] !== target && me.enemy[i].hp > 0 && me.enemy[i].fight_type) {
					others.push(me.enemy[i]);
				}
			}
			nearby = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : target;
		}
		if (nearby && nearby.hp > 0 && nearby.fight_type) {
			var splash = Math.floor(sh * 0.3);
			if (splash > 0) {
				nearby.damage(splash, me);
				me.send_room("<HIC>六脉剑气溅射，" + nearby.name + "受到了" + splash + "点溅射伤害！</HIC>");
			}
		}
	}
};

this.query_enable_prop = function (lv) {
	return {
		unarmed: {
			gj: parseInt(lv * 2005 / 1000),
			mz: parseInt(lv * 2010 / 1000),
			add_sh_per: parseInt(4 + lv / 300),
			diff_fy_per: parseInt(4 + lv / 300),
			desc: "命中敌人后对附近敌人产生溅射伤害",
		},
	};
};

this.pfm = {
	wuxing: {
		name: "无形剑气",
		distime: 29000,
		enable_skill: "unarmed",
		release_time: 3800,
		mp: 30,
		use: function (me, target, lv) {
			me.send_room("<HIW>$N指尖轻弹，六脉神剑「无形剑气」——一道无形无相的剑气破空而出！</HIW>", target);
			me.do_attack({
				target: target,
				gj: me.gj * 2.5,
				mz: me.mz * 1.5,
				attack_msg: "<HIW>一道无形剑气无声无息地射向$n！</HIW>",
				on_parry: function (target, is_parry) {
					if (!is_parry) {
						target.add_status({
							id: "liumai_faint",
							name: "昏迷",
							desc: "被无形剑气震昏",
							duration: Math.min(2000 + parseInt(lv * 5), 7000),
							only_combat: true,
							downside: true,
							is_faint: true,
							start_msg: "<HIW>$N被无形剑气击中，顿时昏迷倒地！</HIW>",
							finish_msg: "$N从昏迷中醒来。",
						}, me);
					}
				}
			});
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			return "以强劲的内力贯于指尖，将内力化为无形剑气伤敌。如果敌方招架成功只受到伤害，否则使敌人昏迷" + (Math.min(2000 + parseInt(lv * 5), 7000) / 1000) + "秒。";
		}
	},
	liumai: {
		name: "六脉纵横",
		distime: 19000,
		enable_skill: "unarmed",
		release_time: 3800,
		mp: 30,
		use: function (me, target, lv) {
			me.send_room("<HIC>$N十指齐出，六脉神剑「六脉纵横」——六道剑气同时激射而出！</HIC>", target);
			// 破碎每层降低防御：3%起步，1000级→4%，2000级→5%
			var defPerStack = 3;
			if (lv >= 2000) defPerStack = 5;
			else if (lv >= 1000) defPerStack = 4;

			var count = 6;
			var validTargets = [];
			if (me.enemy && me.enemy.length > 0) {
				for (var i = 0; i < me.enemy.length; i++) {
					if (me.enemy[i] && me.enemy[i].hp > 0 && me.enemy[i].fight_type) {
						validTargets.push(me.enemy[i]);
					}
				}
			}
			if (validTargets.length === 0 && target && target.hp > 0) {
				validTargets.push(target);
			}
			var swordNames = ["少商剑", "商阳剑", "中冲剑", "关冲剑", "少冲剑", "少泽剑"];
			var swordTmpl = [
				"<HIC>「少商剑」——大拇指一捺，剑气雄劲，石破天惊般射向",
				"<HIC>「商阳剑」——食指疾伸，剑气巧妙灵活，难以捉摸地刺向",
				"<HIC>「中冲剑」——中指一弹，剑气大开大阖，气势雄迈地贯向",
				"<HIC>「关冲剑」——无名指轻拂，剑气拙滞古朴，缓缓推向",
				"<HIC>「少冲剑」——右手小指一挑，剑气轻灵迅速，闪电般点向",
				"<HIC>「少泽剑」——左手小指一伸，剑气忽来忽去，变化精微地袭向",
			];
			for (var i = 0; i < count; i++) {
				var t = validTargets[Math.floor(Math.random() * validTargets.length)];
				if (!t || t.hp <= 0) t = target;
				var si = i % 6;
				var sh = me.do_attack({
					target: t,
					gj: me.gj * 1.2,
					attack_msg: swordTmpl[si] + t.name + "！</HIC>"
				});
				if (sh > 0) {
					// 叠加破碎debuff
					t.add_status({
						id: "liumai_defdown",
						name: "破碎",
						desc: "防御降低" + defPerStack + "%",
						duration: 5000 + parseInt(lv * 5),
						only_combat: true,
						downside: true,
						override: 1,
						max_count: 10,
						prop: { fy_per: -defPerStack },
					}, me);
					// 溅射：对单体造成额外30%伤害（可实现12次伤害）
					var splashTarget = null;
					if (me.enemy && me.enemy.length === 1) {
						splashTarget = t;
					} else if (me.enemy && me.enemy.length > 1) {
						var others = [];
						for (var j = 0; j < me.enemy.length; j++) {
							if (me.enemy[j] && me.enemy[j] !== t && me.enemy[j].hp > 0 && me.enemy[j].fight_type) {
								others.push(me.enemy[j]);
							}
						}
						splashTarget = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : t;
					}
					if (splashTarget && splashTarget.hp > 0) {
						var splashDmg = Math.floor(sh * 0.3);
						if (splashDmg > 0) {
							splashTarget.damage(splashDmg, me);
							me.send_room("<HIC>六脉剑气溅射，" + splashTarget.name + "受到了" + splashDmg + "点溅射伤害！</HIC>");
						}
					}
				}
			}
			me.end_attack(target);
		},
		query_desc: function (me, lv) {
			var defPerStack = 3;
			if (lv >= 2000) defPerStack = 5;
			else if (lv >= 1000) defPerStack = 4;
			return "六脉齐射，随机攻击你的敌人，命中一次叠加一层<hir>破碎</hir>(每层降低" + defPerStack + "%防御，最多10层)，持续10秒。溅射伤害不会触发破碎效果。";
		}
	}
};
