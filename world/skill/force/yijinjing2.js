this.inherits(SKILL);
this.name = "金刚不坏体";
this.id = "yijinjing2";
this.source_skill = "yijinjing";
this.grade = 5;
this.force_rad = 0.9;
this.family = FAMILIES.SHAOLIN;
this.desc = "少林寺的至高内功心法，练至大成可金刚不坏";
this.can_enables = ["force"];
this.learn_condition = {
				max_mp: 5000,
				skill: { force: 500 }
};
this.query_prop = function (lv) {
				return {
								diff_sh_per: 8,
				};
}
this.query_enable_prop = function (lv) {
				return {
								force: {
												max_hp: 20000,
												fy: 2005,
												diff_bj: 3,
												fy_per: 8,
												limit_mp: 285000,
												desc: "唯一：将你内力的90%转化为气血"
								}
				};
}
this.pfm = {
				foguang:
				{
								name: "佛光守护",
								distime: 30000,
								enable_skill: "force",
								mp: 20,
								use_type: 2,
								release_time: 0,
								use: function (me, target, lv) {
												me.send_room("<hiy>只听$N高呼佛号，运起佛光普照，霎那间全身竟犹如镀金一般，发出灿灿金光。</hiy>");
												var tm = me.team || [me];
												for (var i = 0; i < tm.length; i++) {
																if (tm[i].hp > 0 && tm[i].is_here(me)) {
																				tm[i].add_status({
																								id: "foguang",
																								name: "佛光普照",
																								desc: "金刚不坏体之佛光普照增加你的伤害减免",
																								duration: lv + 10000,
																								prop: {
																												diff_sh_per2: 30
																								}
																				});
																}
												}

								},
								query_desc: function (me, lv) {
												return"召唤佛光守护，增加你和你队友的伤害减免30%。";
								}
				},
				roar:
				{
								name: "狮子吼",
								distime: 30000,
								enable_skill: "force",
								mp: 20,
								use_type: 2,
								release_time: 1000,
								use: function (me, target, lv) {

												me.send_room("<hiy>$N深深地吸一囗气，真力迸发，发出一声惊天动地的巨吼。</hiy>");
												if (!me.enemy) return false;
												var list = [];
												var time = lv * 10 + 2000;
												if (time > 7000) time = 7000;
												for (let x of me.enemy) {
																if (x.hp > 0) {
																				list.push(x);
																}
												}
												if (!list.length) return false;
												for (var i = 0; i < list.length; i++) {
																var x = list[i];
																x.notify("你觉得眼前一阵金星乱冒，耳朵痛得像是要裂开一样。");
																x.damage(me.max_mp / 10);
																if (x.max_mp < me.max_mp / 2) {
																				x.add_status({
																								id: "faint",
																								is_faint: true,
																								duration: time,
																								name: "昏迷", downside: true,
																								finish_msg: "<hiy>慢慢的$N又恢复了知觉...</hiy>\n",
																								start_msg: "<hir>$N只觉得眼前一黑，接着什么都不知道了...</hir>\n"
																				});
																}
																me.end_attack(x);
												}
								},
								query_desc: function (me, lv) {
												var time = lv * 10 + 2000;
												if (time > 7000) time = 7000;
												return"深深地吸一囗气，真力迸发，发出一声惊天动地的巨吼，对附近敌人造成你最大内力10%(" + parseInt(me.max_mp / 10) +")的伤害，如果敌人内力小于你内力的50%将昏迷" + (time / 1000) +"秒。";
								}
				}, zhao:
				{
								name: "金刚罩",
								distime: 60000,
								enable_skill: "force",
								mp: 20,
								use_type: 2,
								release_time: 0,
								use: function (me, target, lv) {
												me.send_room("<hiy>$N高呼佛号，全身真气鼓动，犹如金铸之钟，坚不可摧。</hiy>");
												me.add_status({
																id: "force",
																name: "金刚罩",
																desc: "大幅减少你受到的伤害",
																duration: parseInt(lv * 10),
																prop: {
																				diff_sh_per2: 60
																}
												});

								},
								query_desc: function (me, lv) {
												return"减少你受到的伤害，" + (parseInt(lv * 10 / 1000)) + "秒内增加60%伤害减免。";
								}
				}
};
