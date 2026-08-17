	this.inherits(SKILL);
	this.name = "极乐六性";
	this.id = "jileliuxing";
	this.grade = 2;
	this.family = FAMILIES.SUNV;
	this.desc = "素女道独门掌法，以容貌动人，以色相惑敌。容貌胜于对手则无往不利，招式诡谲难测";
	this.can_enables = ["unarmed"];
	this.learn_condition = { max_mp: 1000, skill: { unarmed: 100 } };

	this.query_enable_prop = function (lv) {
		return {
			unarmed: {
				gj: lv * 2 + 30,
				mz: lv + 30,
				per: Math.round(lv / 10),
			}
		};
	}

	this.pfm = {
		liuxing: {
			name: "极乐六性",
			distime: 18000,
			enable_skill: "unarmed",
			release_time: 2000,
			mp: 30,
			use: function (me, target, lv) {
				if (!target) return me.notify("你要用极乐六性对付谁？");
				// 只要自己容貌比敌人高就必定击中
				if (me.per > target.per) {
					me.send_room("<HIM>$N施展极乐六性，如天女散花般惑人心神，$n心神荡漾，无从闪避！</HIM>", target);
					var dmg = me.gj * (1.5 + lv / 500);
					target.damage(dmg, me);
					me.send_room("<HIM>$N的极乐六性正中$n要害，造成" + Math.round(dmg) + "点伤害！</HIM>", target);
					// 如果容貌大幅超越，额外追加一次攻击
					if (me.per > target.per + 20) {
						target.damage(dmg * 0.5, me);
						me.send_room("<HIM>$n被$N的美貌所惑，心神失守，再受重创！</HIM>", target);
					}
				} else {
					me.send_room("$N施展极乐六性，但$n定力过人，不为所动。", target);
					me.do_attack({target: target, gj: me.gj * 0.8});
				}
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				var per = me.query_prop("per");
				return "以容貌惑敌，若自身容貌（当前" + (per || 0) + "）高于对手则必定命中并造成150%+攻击伤害。若容貌超越对手20点以上，则追加50%额外伤害。";
			}
		}
	};
