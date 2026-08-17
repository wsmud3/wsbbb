this.inherits(SKILL);
this.name = "七伤拳";
this.id = "qishangquan";
this.grade = 3;
this.is_public = true;
this.attack_actions = [
	"$N运起七伤拳，一招「损心诀」，拳风凌厉直击$n的$l",
	"$N使出七伤拳「伤肺诀」，拳势如山崩地裂，猛击$n的胸口",
	"$N催动「摧肝肠诀」，双拳连环击出，拳拳直取$n的要害",
	"$N一式「藏离诀」，拳劲暗藏后招，击向$n的$l",
	"$N施展「精失诀」，拳法飘忽不定，忽左忽右击向$n",
	"$N运起「意恍惚诀」，身形一晃，一拳已到$n面门",
	"$N使出七伤拳最后一式「七伤总诀」，七股拳劲如同七道惊雷轰向$n"
	];
this.parry_actions = [
	"$n运起七伤拳「藏离诀」守势，拳劲暗蓄不发，将$N的攻击力道尽数收纳化解",
	"$n双拳交错，一式「损心诀」反守为攻，以凌厉拳风截击$N的攻势破绽",
	"$n身形沉稳，七伤拳「伤肺诀」守势如山岳不移，$N的攻击被浑厚拳劲一一挡回",
	"$n拳劲暗涌，一招「意恍惚诀」守招飘忽不定，$N的猛攻如击幻影尽数落空",
	"$n沉喝一声，七伤拳「七伤总诀」守势全面展开，七股拳劲交织成网封住$N所有攻势"
	];
this.desc = "崆峒派镇派绝学，一拳中有七股劲力，或刚猛或阴柔或横出或直送，中者必受内伤";
this.can_enables = ["unarmed", "parry"];
this.learn_condition = {
	max_mp: 3000,
	skill: { unarmed: 300 }
	};

this.query_enable_prop = function (lv) {
	return {
			unarmed: {
				gj: parseInt(lv * 1.6) + 10,
				str: parseInt(lv * 125.0 / 1000),
				max_hp: lv * 10,
			},
			parry: {
				zj: parseInt(lv * 1.6) + 10,
				fy: parseInt(lv * 1.2) + 0,
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "七伤",
			distime: 20000,
			enable_skill: "unarmed",
			release_time: 7000,
			mp: 20,
			use: function (me, target, lv) {
				var selfDmg = Math.floor(me.gj * 0.2);
				me.from_attack(selfDmg, 0, null, "");
				me.send_room("<HIR>$N一拳击出，拳风之中蕴含七伤之意——「七伤」！伤敌先伤己，$N自身先受其害，但拳力也因此暴增！</HIR>", target);
				me.do_attack({
					target: target,
					gj: Math.floor(me.gj * 1.5),
					mz: me.mz,
				});
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "先伤己，再伤人，一拳七伤，七者皆伤，损心伤肺摧肝肠，每拳自身受到20%伤害，每命中一拳增加总诀式50%伤害";
			}
		}
	};
