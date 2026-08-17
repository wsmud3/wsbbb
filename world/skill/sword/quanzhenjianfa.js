	this.inherits(SKILL);
	this.name = "全真剑法";
	this.id = "quanzhenjianfa";
	this.grade = 3;
	this.attack_actions = [
		"$N全真剑法堂堂正正，一剑刺出，浩然正气扑面而来",
		"$N剑招沉稳，每一剑都蕴含道家真意，直取$n的$l",
		"$N左足踏出，$w平胸刺出，剑含道家冲虚之意，直指$n中宫",
		"$N神情肃然，$w缓缓划出一个太极圆弧，剑劲圆转如意，向$n当胸圈去",
		"$N剑势陡然转疾，全真剑法由缓入急，$w化作一道白虹贯向$n",
		"$N凝神静气，$w上隐隐透出纯阳正气，一剑递出便如旭日东升，$n但觉一股浩然之气扑面而来",
		"$N脚踏七星，$w回旋之间暗合北斗之数，七道剑光分取$n七处大穴",
		"$N口诵道号，$w在手中画出一个「敕」字，剑光如符箓般印向$n的$l"
		];
	this.parry_actions = [
		"$n神色淡然，$w随手一圈，全真剑法守势如太极圆融，$N的攻势被轻描淡写地化去",
		"$n脚踏禹步，$w在身前画出道道剑圈，$N的$w刺入圈中，竟被一股柔劲带得偏了方向",
		"$n竖剑当胸，剑脊上映出$N的攻势，全真守御之道以静制动，$N的杀招无功而返",
		"$n不慌不忙，$w看似平淡无奇地斜斜一封，却将$N的所有后着变化尽数封死",
		"$n口宣道号，$w之上纯阳真气流转，以一股浩然正气将$N的攻势震得七零八落"
		];
	this.desc = "全真教正宗剑法，中正平和";
	this.can_enables = ["sword", "parry"];
	this.learn_condition = {
		max_mp: 3000,
		skill: { sword: 300 }
		};

	this.query_enable_prop = function (lv) {
		return {
				sword: {
					gj: parseInt(lv * 1.6) + 10,
					int: parseInt(lv * 127.0 / 1000),
					mz: lv * 1 + 10,
				},
				parry: {
					zj: parseInt(lv * 1.3) + 10,
					int: parseInt(lv * 100.0 / 1000),
					con: parseInt(lv * 100.0 / 1000),
				},
			}
		}

	this.pfm = {
		pfm1: {
				name: "三连环",
				distime: 15000,
				enable_skill: "sword",
				release_time: 3096,
				mp: 25,
				use: function (me, target, lv) {
					me.send_room("<HIW>$N将全真内功催至极致，手中$w嗡嗡作响，剑身白光大盛——「三连环」！$N脚踏天罡步伐，一剑如长虹、二剑如白练、三剑如惊雷，三剑连环相扣一气呵成！</HIW>", target);
					for (var i = 0; i < 3; i++) {
						me.do_attack({
							target: target,
							gj: Math.floor(me.gj * (100 + i * 20) / 100),
							mz: me.mz,
						});
					}
					me.end_attack(target)
				},
				query_desc: function (me, lv) {
					return "瞬间攻击3招，每招增加20%伤害";
				}
			}
		};
