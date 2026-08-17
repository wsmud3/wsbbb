this.inherits(SKILL);
this.name = "猴拳";
this.id = "houquan";
this.grade = 1;

this.attack_actions = [
	"$N单腿微曲，忽的向前扑出，一式「仙猴摘桃」，二爪直出，抓向$n的双眼",
	"$N左手虚晃，一式「灵猴攀枝」，右手直击，反扣$n的肩井大穴",
	"$N忽然缩成一团，使一式「八方幻影」，双掌无形无定，一爪抓向$n的胸口",
	"$N猛吸一口气，一弯腰，使一式「水中揽月」，双爪疾扣向$n的小腹",
	"$N猛的向上高高跃起，一式「落地摘星」，居高临下，一爪罩向$n的头骨"
	];
this.desc = "拳术中象形拳的一种，因模仿猴子的各种动作而得名。";
//"(\w+)"(.+?)"NOR"
//<$1>$2</$1>
this.can_enables = ["unarmed"];

this.query_enable_prop = function (lv) {
	return {
			unarmed: {
				gj: lv * 1 + 5,
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "寸劲",
			distime: 7000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 15,
			use: function (me, target, lv) {
				me.send_room("$N施展了猴拳的寸劲。", target);
				me.do_attack({target: target});
				me.end_attack(target);
			},
			query_desc: function (me, lv) {
				return "在近距离攻击即将完成的瞬间，突然爆发，造成基本攻击附加1100的伤害。";
			}
		}
	};
