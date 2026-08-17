	this.inherits(SKILL);
	this.name = "金蛇游身步";
	this.id = "jinsheyoushenbu";
	this.grade = 3;
	this.desc = "金蛇游身步";
	this.can_enables = ["dodge"];
	this.learn_condition = {
		skill: { dodge: 300 }
	};
	this.query_enable_prop = function (lv) {
		return {
			dodge: {
				ds: Math.floor(1.6 * lv + 30),
				busy_per: 20,
			}
		};
	}
	this.query_dodge_action = function() {
		return this.dodge_actions.random();
	};
	this.dodge_actions = [
		"$n身形一晃，$N的攻击已然落空。",
		"$n足尖轻点，向后跃开，$N这一招扑了个空。",
		"$n一个「旱地拔葱」，身体向上笔直地纵起丈余，躲过了$N这一招。",
		"$n往后一纵，$N的攻击差之毫厘。",
		"$n身子一侧，$N的攻击擦身而过。",
		"$n陡然变招，$N的攻击被轻松化解。",
		"$n身形如金蛇蜿蜒，腰肢一摆便贴地滑出数尺，$N的招式堪堪落空。",
		"$n使出一招「金蛇盘柳」，身体如蛇般柔若无骨地扭转，$N的猛攻竟从$n身侧滑过，未触分毫。"
	];
	this.pfm = {
		pfm1: {
			name: "金蛇游身",
			distime: 30000,
			enable_skill: "dodge",
			release_time: 3096,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N身形如金蛇蜿蜒——「金蛇游身」！$N整个人如蛇般绕着$n飞速游走，$n只觉眼前蛇影重重，仿佛被万千毒蛇缠身！</HIY>", target);
				if (me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz,
				})) {
					target.add_status({
						id: "busy",
						name: "忙乱",
						desc: "被金蛇游身所困，无法攻击和招架",
						is_busy: true,
						duration: Math.min(1000 + parseInt(lv * 5), 6000),
						downside: true,
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "金蛇游身，宛若万蛇缠身。成功后使敌人忙乱6秒。";
			}
		}
	};
