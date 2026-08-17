	this.inherits(SKILL);
	this.name = "灵蛇杖法";
	this.id = "lingshezhangfa";
	this.grade = 4;
	this.desc = "白驼山庄欧阳锋所创奇门杖法，杖出如灵蛇蜿蜒，诡异莫测，杖中更藏有剧毒机关，令人防不胜防";
	this.can_enables = ["staff", "parry"];
	this.attack_actions = [
		"$N杖出如灵蛇，杖尖颤动不定，点向$n的$l",
		"$N手中杖棒化作一道青影，如灵蛇出洞般刺向$n",
		"$N杖法诡奇，杖影重重，令$n难以捉摸",
		"$N手腕一抖，$w杖尖忽左忽右，如灵蛇吐信，嘶嘶声中已袭至$n面门",
		"$N身形游走不定，$w从腋下反穿而出，这一杖走势诡异之极，完全违背武学常理",
		"$N猛然将$w在地上一顿，杖身弯曲如弓，随即弹射而出，杖尖如毒蛇扑食般直噬$n咽喉",
		"$N杖法展开，$w化作数十道青色杖影，如群蛇乱舞，将$n困在蛇阵之中",
		"$N阴笑一声，$w杖身竟似活物般蜿蜒扭动，杖尖从不可思议的角度点向$n的$l"
	];
	this.parry_actions = [
		"$n将$w舞得密不透风，杖影如灵蛇盘阵，$N的攻势撞入蛇阵便被绞得粉碎",
		"$n杖尖连点，$w如灵蛇般绕着$N的$w急转，一股奇异的黏劲将攻势带偏",
		"$n身形诡异的一扭，$w从身后甩出，以不可思议的角度将$N的$w牢牢缠住",
		"$n手中$w化作一道青蛇般的弧光，在身前游走不定，$N的攻势被这诡异守招尽数封死",
		"$n杖法忽变，$w杖身弯曲如蛇，竟以杖身缠绕住$N的$w，随即猛力一绞，将攻势化解于无形"
	];
	this.learn_condition = {
		max_mp: 4000,
		skill: { staff: 400 }
	};
	this.query_enable_prop = function (lv) {
		return {
			staff: {
				gj: parseInt(lv * 1.2) + 10,
				mz: lv * 1,
				dex: parseInt(lv * 100.0 / 1000),
				zj: lv * 1,
			},
			parry: {
				zj: parseInt(lv * 1.2) + 10,
				dex: parseInt(lv * 127.0 / 1000),
				diff_sh_per: 4,
			},
		};
	}
	this.pfm = {
		pfm1: {
			name: "灵蛇出洞",
			distime: 10000,
			enable_skill: "staff",
			release_time: 3096,
			mp: 30,
			use: function (me, target, lv) {
				me.send_room("<HIG>$N杖法如灵蛇——「灵蛇出洞」！$w化作三道蛇影，从三个诡异角度同时噬向$n！</HIG>", target);
				for (var i = 0; i < 3; i++) {
					if (me.do_attack({
						target: target,
						gj: me.gj,
						mz: me.mz,
					})) {
						var poison = parseInt(lv * 1.5) + 50;
						target.damage(poison, me, 0);
						me.send_room("<HIG>$n被灵蛇杖中的毒蛇咬中，身中剧毒！</HIG>", target);
					}
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "灵蛇出洞，瞬间攻击3次，攻击中必定触发毒蛇攻击";
			}
		}
	};
