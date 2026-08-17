this.inherits(SKILL);
this.name = "流云掌";
this.id = "liuyunzhang";
this.grade = 2;

this.attack_actions = [
	"$N使一招「天马行空」，右掌一翻，向$n的$l拍去",
	"$N使一招「探手截流」，右手斜出，劈向$n的$l",
	"$N双手带风，一式「风吹云散」，掌力浑厚，击向$n的$l",
	"$N双手微抬，左右齐出，一招「云深雾锁」，已将$n$l笼罩",
	"$N双掌翻腾，掌风凌厉，一式「云雾缭绕」，飘然不定，击向$n$l",
	"$N双掌拍出，一式「顺流逆流」，掌法一快一慢，向$n的$l打去",
	"$N快步向前，身法陡快，一招「行云流水」，掌风已到$n$l",
	"$N双掌下垂，似是无力，但又猛然加快，似攻非攻，一式「流水无情」使出，双掌已到$n$l"
	];
this.desc = "流云掌法的绝招，乃是以快速的身法及掌法连出虚招将对手困住";
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
				gj: parseInt(lv * 1.2) + 5,
				gjsd: -200,
				mz: parseInt(lv * 1.3) + 5,
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "排山倒海",
			distime: 18000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 20,
			use: function (me, target, lv) {
				me.send_room("<HIW>$N掌力如排山倒海——「排山倒海」！掌风呼啸而出，势不可挡！</HIW>", target);
				if (me.do_attack({
					target: target,
					gj: me.gj * 3,
					mz: me.mz,
				})) {
					me.add_status({
						id: "paishan",
						name: "加速",
						desc: "攻击速度提高" + (10 + parseInt(lv / 100)) + "%",
						duration: parseInt(lv * 10),
						prop: { gjsd_per: 10 + parseInt(lv / 100) },
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "将体内雄浑的内力运于掌风，攻向敌人，对敌人造成300%的伤害，命中后提高自己的攻击速度" + (10 + parseInt(lv / 100)) + "%。";
			}
		}
	};
