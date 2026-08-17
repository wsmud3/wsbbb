this.inherits(SKILL);
this.name = "化骨绵掌";
this.id = "huagumianzhang";
this.grade = 2;

this.attack_actions = [
	"身形微晃，一招<HIB>「长恨深入骨」</HIB>，十指如戟，插向$n的双肩锁骨",
	"$N出手如风，十指微微抖动，一招<HIB>「素手裂红裳」</HIB>抓向$n的前胸",
	"$N双手忽隐忽现，一招<HIB>「长风吹落尘」</HIB>，鬼魅般地抓向$n的肩头",
	"$N左手当胸画弧，右手疾出，一招<HIB>「明月映流沙」</HIB>，猛地抓向$n的额头",
	"$N使一招<HIB>「森然动四方」</HIB>，激起漫天的劲风，撞向$n",
	"$N面无表情，双臂忽左忽右地疾挥，使出<HIB>「黯黯侵骨寒」</HIB>，十指忽伸忽缩，迅猛无比地袭向$n全身各处大穴",
	"$N使出<HIB>「黄沙飘惊雨」</HIB>，蓦然游身而上，绕着$n疾转数圈，$n正眼花缭乱间，$N已悄然停在$n身后，右手划出一道光圈，接着右手冲出光圈猛抓$n的后背",
	"$N突然双手平举，$n一呆，正在猜测间，便见$N嗖的一下将双手收回胸前，接着一招<HIB>「白骨无限寒」</HIB>，五指如钩，直抓向$n的腰间"
	];
this.desc = "蛇岛神龙教绝技，以掌为主，运转舒展，动作连绵不断，劲力阴毒无比";

this.can_enables = ["unarmed"];
this.learn_condition = {
	max_mp: 2000,
	skill: { unarmed: 200 }
	};

this.query_enable_prop = function (lv) {
	return {
			unarmed: {
				gj: lv * 1 + 5,
			},
		}
	}

this.pfm = {
	pfm1: {
			name: "化骨",
			distime: 7000,
			enable_skill: "unarmed",
			release_time: 3096,
			mp: 20,
			use: function (me, target, lv) {
				var decStr = Math.floor(lv * 210 / 1000);
				me.send_room("<HIG>$N掌含化骨之力——「化骨」！一股阴柔掌力透骨而入，$n顿觉浑身酸软无力！</HIG>", target);
				if (me.do_attack({
					target: target,
					gj: me.gj,
					mz: me.mz,
				})) {
					target.add_status({
						id: "huagu",
						name: "化骨",
						desc: "臂力减少" + decStr + "点",
						duration: 15000 + parseInt(lv * 5),
						downside: true,
						prop: { str: -decStr },
					});
				}
				me.end_attack(target)
			},
			query_desc: function (me, lv) {
				return "使用化骨绵掌的阴柔掌力，使敌人骨骼其软如绵，浑身无力，在" + (15 + parseInt(lv * 5 / 1000)) + "秒内减少" + (Math.floor(lv * 210 / 1000)) + "点臂力。";
			}
		}
	};
