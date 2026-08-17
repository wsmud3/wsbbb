this.inherits(SKILL);
this.name = "密宗大手印";
this.id = "dashouyin";
this.grade = 1;

this.attack_actions = [
	"$N使出一招<HIC>「莲花合掌印」</HIC>，双掌合十，直直撞向$n的前胸",
	"$N使出一招<HIW>「合掌观音印」</HIW>，飞身跃起，双手如勾，抓向$n的$l",
	"$N使出一招<HIY>「准提佛母印」</HIY>，运力于指，直取$n的$l",
	"$N使出一招<HIR>「红阎婆罗印」</HIR>，怒吼一声，一掌当头拍向$n的$l",
	"$N使出一招<HIG>「药师佛根本印」</HIG>，猛冲向前，掌如游龙般攻向$n",
	"$N使出一招<HIM>「威德金刚印」</HIM>，伏身疾进，双掌自下扫向$n的$l",
	"$N使出一招<HIB>「上乐金刚印」</HIB>，飞身横跃，双掌前后击出，抓向$n的咽喉",
	"$N使出一招<HIW>「六臂智慧印」</HIW>，顿时劲气弥漫，天空中出现无数掌影打向$n的$l"
	];
this.desc = "密宗大手印，需要密宗心法支持。";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["unarmed"];

this.query_enable_prop = function (lv) {
	return {
			unarmed: {
				gj: lv * 1 + 20,
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "金刚印",
			distime: 16000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 15,
			use: function (me, target, lv) {
				var mz_lv = me.query_skill("mizongxinfa", 1) || 0;
				var bonus = lv + mz_lv;
				me.send_room("<HIY>$N默运密宗心法，双手结印——「金刚印」！一道金光大手印轰然推出！</HIY>", target);
				me.do_attack({
					target: target,
					gj: me.gj + bonus,
				});
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "默运密宗心法，双手结印，对敌人造成自身攻击力附加" + (lv + me.query_skill("mizongxinfa", 1)) + "(密宗大手印等级+密宗心法等级)的伤害。";
			}
		}
	};
