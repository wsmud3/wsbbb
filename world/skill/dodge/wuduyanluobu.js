this.inherits(SKILL);
this.name = "五毒烟萝步";
this.id = "wuduyanluobu";
this.grade = 3;
this.dodge_actions = [
	"$n不慌不忙，一式「江水横流」，身行倏的向一旁平移数尺,堪堪躲过了$N的功势。",
	"$n身行如鬼魅般一晃，刹那间已远去数丈之外，$N顿时扑了个空。",
	"$n身行忽的加快，如一缕青烟般绕着$N飞快旋转，看得$N一阵头晕眼花，急忙收招跳开。",
	"只见$n身子向后一翻，一招「缥渺孤鸿影」，后荡而起，掠向一旁。",
	"$n怪异的一笑，身行忽的变得朦胧不清，$N的凌厉招式竟然透体而过，原来竟是一具幻影。",
	"$n的身行顿时变得如蛇一般柔软，随着$N的招式左右摆动，竟使得$N招招落空。",
	"$n足尖轻点，身形如一缕毒烟般袅袅升起，$N抬头望去，只见烟雾缭绕之中，$n的身影已飘至三丈开外。",
	"$n施出「五毒迷踪」，身形所过之处留下一道淡淡的紫色烟痕，$N的攻势被这诡异的烟幕所惑，尽数打在空处。"
	];
this.can_enables = ["dodge"];
this.learn_condition = {
	max_mp: 3000,
	skill: { dodge: 300 }
	};

this.query_enable_prop = function (lv) {
	return {
			dodge: {
				ds: parseInt(lv * 1.6) + 30,
				dex: parseInt(lv * 142.0 / 1000),
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "金蛇游身",
			distime: 30000,
			enable_skill: "dodge",
			release_time: 3096,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIY>$N身形如鬼魅般一晃，施出「金蛇游身」——刹那间化作一缕青烟，整个人如金蛇蜿蜒般绕着$n飞速游走，$n只觉眼前烟影重重，分不清东南西北，仿佛被万千毒蛇缠身！</HIY>", target);
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
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "金蛇游身，宛若万蛇缠身，成功后使敌人忙乱6秒";
			}
		}
	};
