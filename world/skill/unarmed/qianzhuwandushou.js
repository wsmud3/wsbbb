this.inherits(SKILL);
this.name = "千蛛万毒手";
this.id = "qianzhuwandushou";
this.grade = 3;

this.attack_actions = [
	"$N身形一晃而至，一招「小鬼勾魂」，双掌带着一缕腥风拍向$n的前心",
	"$N身形化做一缕轻烟绕着$n急转，一招「天网恢恢」，双掌幻出无数掌影罩向$n",
	"$N大喝一声，一招「恶鬼推门」，单掌如巨斧开山带着一股腥风猛劈向$n的面门",
	"$N一声冷笑，一招「灵蛇九转」，身形一闪而至，一掌轻轻拍出，手臂宛若无骨，掌到中途竟连变九变，如鬼魅般印向$n的$l",
	"$N侧身向前，一招「地府阴风」，双掌连环拍出，一缕缕彻骨的寒气从掌心透出，将$n周围的空气都凝结了",
	"$N厉叫一声，身形忽的蜷缩如球，飞身撞向$n，一招「黄蜂吐刺」单掌如剑，直刺$n的心窝",
	"$N一个急旋，飞身纵起，半空中一式「毒龙摆尾」，反手击向$n的$l",
	"$N大喝一声，运起五毒神功，一招「毒火焚身」，刹那间全身毛发尽绿，一对碧绿的双爪闪电般的朝$n的$l抓去"
];
this.parry_actions = [
	"$n双掌翻飞，千蛛万毒手「天网恢恢」守势展开，掌影如蛛网般将$N的攻击层层缠住",
	"$n身形诡异一扭，一招「灵蛇九转」守招施出，手臂无骨般柔转将$N的攻击引偏",
	"$n运气于掌，千蛛万毒手「地府阴风」守势运转，彻骨寒气将$N的攻势冻结于半途",
	"$n冷笑一声，一式「五毒护体」展开，掌心毒气弥漫将$N的攻击逼退三尺",
	"$n不退反进，千蛛万毒手「毒甲护身」守招施出，$N的拳掌撞上布满毒劲的双臂被反震而回"
];
this.desc = "五毒教的千蛛万毒手";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["unarmed", "parry"];
this.learn_condition = {
	max_mp: 3000,
	skill: { unarmed: 300 }
	};

this.query_enable_prop = function (lv) {
	return {
			unarmed: {
				gj: parseInt(lv * 1.5) + 20,
				mz: lv * 1,
				str: parseInt(lv * 125.0 / 1000),
			},
			parry: {
				zj: parseInt(lv * 1.5) + 20,
				fy: lv * 1,
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "千蛛万毒",
			distime: 36000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N双爪齐出，千蛛万毒手的毒劲全面爆发——「千蛛万毒」！碧绿色的毒雾自$N爪间喷涌而出，$n顿觉腥风扑面！</HIG>", target);
				if (me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz,
				})) {
				var dps = Math.floor(lv * 3.37);
				target.add_status({
						id: "qianzhu",
						name: "蛛毒",
						desc: "身中千蛛万毒，每" + (parseInt(lv * 5 / 1000)) + "秒受到" + dps + "点伤害",
						duration: parseInt(lv * 5),
						duration_count: 4,
						downside: true,
						override: 1,
						data: { dps: dps },
						start_msg: "<HIG>$n被千蛛万毒手的剧毒侵入体内，伤口发黑溃烂！</HIG>",
						finish_msg: "<CYN>$n体内的蛛毒终于消退。</CYN>",
						on_interval: function(target, count) {
							var dps = this.data ? this.data.dps : 0;
							target.from_attack(dps * count, 999999, null, "<HIG>$N蛛毒发作，浑身剧痛！</HIG>");
						},
					});
			}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "将全身毒力集中在一点刺向敌人，命中后使敌人在" + (parseInt(lv * 5) * 4 / 1000) + "秒内持续受到" + (Math.floor(lv * 3.37)) + "点伤害。";
			}
		},
	pfm2: {
			name: "万蛊噬天",
			distime: 60000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<HIR>$N仰天狂啸，体内万蛊齐鸣——「万蛊噬天」！$N周身爬满毒蛊虚影，形成一道蛊虫护甲，攻击$N者将被毒蛊反噬！</HIR>", me);
				me.add_status({
					id: "wangu",
					name: "万蛊",
					desc: "被敌人命中时使敌人受到2200点伤害",
					duration: 10000 + parseInt(lv * 10),
					prop: { reflect_sh: 2200 },
				})},
			query_desc: function (me, lv) {
				return "毒气弥漫，笼罩全身，" + (10 + parseInt(lv * 10 / 1000)) + "秒内在被敌人命中时候使敌人受到2200点伤害。";
			}
		}
	};
;
this.query_prop = function (lv) {
	return {
			per: (-parseInt(lv / 300) - 1)
		};

	this.query_enable_prop = function (lv) {
			return {
				unarmed: {
				gj: parseInt(lv * 1.5) + 20,
				mz: lv * 1,
				str: parseInt(lv * 125.0 / 1000),
			},
				parry: {
				zj: parseInt(lv * 1.5) + 20,
				fy: lv * 1,
			},
			}
		};
}
