this.inherits(SKILL);
this.name = "八卦拳";
this.id = "baguaquan";
this.grade = 2;

this.attack_actions = [
	"$N双掌一错，使出「乾字决」，双拳一上一下对准$n的$l连拍三招",
	"$N绕着$n一转，满场游走，拳出如风，连绵不绝地击向$n，正是八卦拳中的「坤字决」",
	"$N使出一招「巽字决」，左拳虚击$n的前胸，一错身，右拳迅速横扫$n的太阳穴",
	"$N使一招「坎字决」左拳击出，不等招式使老，右拳已从左拳之底穿出，对准$n的$l「呼」地一拳",
	"$N使出一招「震字决」，身形一低，左手护顶，右手已迅雷不及掩耳的一拳击向$n的裆部",
	"$N左拳突然张开，拳开变掌，直击化为横扫，一招「兑字决」便往$n的$l招呼过去",
	"$N一招「离字决」，顿时幻出重重拳影，气势如虹，铺天盖地袭向$n全身",
	"$N微微一笑，手捏「艮字决」，飞身跃起，半空中一脚踢向$n面门，却是个虚招。说时迟那时快，只见$N一个倒翻，双拳已到了$n的$l"
	];
this.desc = "以阴阳八卦为基础创造出来的一式拳法";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["unarmed"];
this.learn_condition = {
	max_mp: 2000,
	skill: { unarmed: 200 }
	};

this.query_enable_prop = function (lv) {
	return {
			unarmed: {
				gj: parseInt(lv * 1.2) + 20,
				mz: parseInt(lv * 1.2) + 20,
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "震字诀",
			distime: 20000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<HIW>$N脚踩八卦——「震字诀」！内力催发，一拳震出，势如雷霆！</HIW>", target);
				var mp_dmg = parseInt(me.max_mp * 0.2);
				me.do_attack({
					target: target,
					gj: me.gj + mp_dmg,
				});
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "对敌人造成你20%最大内力的伤害。";
			}
		}
	};
;
this.slots = [
	{
			prop: 'bgq_mz',
			value: (lv) => 10,
			format: (val) => {
				return '震字诀命中增加10%';
			},
	},
	{
			prop: 'bgq_nl',
			value: (lv) => 5,
			format: (val) => {
				return '震字诀附加的内力增加5%';
			},
	}
	];
