this.inherits(SKILL);
this.name = "天长掌法";
this.id = "tianchangzhang";
this.grade = 3;

this.attack_actions = [
	"$N使一招<GRN>「青山隐隐」</GRN>，双手划了个半圈，按向$n的$l",
	"$N使一招<MAG>「云霞出海」</MAG>，左手轻轻一挥，劈向$n的$l",
	"$N右手掌心向外，由右向左，使一招<CYN>「星河鹭起」</CYN>，向$n的$l打去",
	"$N使一招<HIM>「彩舟云淡」</HIM>，分击$n的胸口和$l",
	"$N使一招<HIB>「月照幽林」</HIB>，左右掌同时击出，在空中突然左右掌方向互变",
	"$N左手不住晃动，右掌一招<HIW>「白日参辰」</HIW>，向$n的$l打去",
	"$N左手变掌为啄，右掌立掌如刀，一招<HIY>「鹤舞白沙」</HIY>，劈向$n的$l",
	"$N左脚退后半步，右掌使一招<HIC>「水天一色」</HIC>，横挥向$n",
	"$N一招<CYN>「月华流照」</CYN>，左掌先发而后至，右掌后发而先至",
	"$N双掌缩入袖中，双袖飞起扫向$n的$l，却是一招<HIR>「嫦娥奔月」</HIR>，仪态潇洒",
	];
this.desc = "恒山派绝学掌法";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["unarmed"];
this.learn_condition = {
	max_mp: 3000,
	skill: { unarmed: 300 }
	};

this.query_enable_prop = function (lv) {
	return {
			unarmed: {
				gj: parseInt(lv * 1.2) + 20,
				fy: parseInt(lv * 1.3) + 20,
				max_hp: lv * 10,
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "天长叠掌",
			distime: 20000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 25,
			use: function (me, target, lv) {
				me.send_room("<HIM>$N双掌连环拍出——「天长叠掌」！掌力一重接着一重，如潮水般涌向$n！</HIM>", target);
				me.do_attack({
					target: target,
					gj: me.gj * 3,
					mz: me.mz,
				});
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "攻击敌人造成300%的伤害，等级越高命中越高";
			}
		}
	};
