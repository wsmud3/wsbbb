this.inherits(SKILL);
this.name = "胡家刀法";
this.id = "hujiadaofa";
this.grade = 2;

this.attack_actions = [
	"$N手中$w横推，一招<HIM>「推波助澜」</HIM>，由上至下向$nl砍去",
	"$N一招<HIC>「沙鸥掠波」</HIC>，刀锋自下而上划了个半弧，$w一提一收，平刃挥向$n的颈部",
	"$N使出一招<HIB>「天设牢笼」</HIB>，将$w舞得如白雾一般压向$n",
	"$N一招<HIG>「闭门铁扇」</HIG>，$w缓缓的斜着向$n推去",
	"$N手拖$w，转身跃起，一招<RED>「翼德闯帐」</RED>，一道白光射向$n的胸口",
	"$N挥舞$w，使出一招<HIW>「白鹤舒翅」</HIW>，上劈下撩，左挡右开，齐齐罩向$n",
	"$N一招<GRN>「春风送暖」</GRN>，左脚跃步落地，$w顺势往前，挟风声劈向$n的$l",
	"$N募的使一招<HIM>「八方藏刀」</HIM>，顿时剑光中无数朵刀花从四面八方涌向$n全身"
	];
this.parry_actions = SKILL.get("parry").parry_actions;
this.desc = "关外胡家赖以成名的刀法，为胡家始祖飞天狐狸所创。胡斐据家传刀谱练成后与金面佛苗人凤的苗家剑齐名天下。";
//"\+(\w+)\+"(.+?)"\+NOR\+"
//<$1>$2</$1>
this.can_enables = ["blade", "parry"];
this.learn_condition = {
	max_mp: 2000,
	skill: { blade: 200 }
	};

this.query_enable_prop = function (lv) {
	return {
			blade: {
				gj: lv * 15 + 10,
				dex: Math.floor(lv * 1.25),
			},
			parry: {
				zj: lv * 15 + 4,
				desc: "招架成功后立刻反击敌人，5秒冷却",
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "八方藏刀",
			distime: 10000,
			enable_skill: "blade",
			release_time: 5000,
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<HIM>$N身形疾转，手中$w寒光四射——「八方藏刀」！霎时间八道刀光从四面八方同时劈向$n，刀光如雪片纷飞，$n无处可躲！</HIM>", target);
				for (var i = 0; i < 8; i++) {
					me.do_attack({
						target: target,
						gj: me.gj,
						mz: Math.floor(me.mz * (100 + i * 10) / 100),
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "快速出刀，释放成功后在5秒内出刀8次，每刀命中增加10%";
			}
		}
	};
;
this.on_parry_over = function (me, target, par) {
	if (par.is_parry) {
			if (!me.query_temp("sk/hu/parry")) {
				me.do_attack({
				target: target,
				attack_msg: "<hic>$N化守为攻，使出一招「大雪纷纷」，$W发出万长白芒，寒光四射，直劈向$n！</hic>",

			}); me.end_attack(target);
				me.set_temp("sk/hu/parry", 1, 5000);
			}
		}
	}
