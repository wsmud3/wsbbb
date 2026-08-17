this.inherits(SKILL);
this.name = "长生诀";
this.id = "changshengjue";
this.grade = 6;
this.force_rad = 1.5;
this.desc = "上古四大奇书之一，修炼后可大幅提升生命力和内力上限，传说修炼至大成可长生不死。";
this.can_enables = ["force"];
this.learn_condition = {
				skill: { force: 800 }
};

this.query_enable_prop = function (lv) {
				return {
								force: {
												fy_per: parseInt(lv * 0.015),
												hp_per: parseInt(lv * 0.015),
												diff_sh_per: parseInt(lv * 0.01),
												limit_mp: lv * 1000,
												desc: "震慑：进入战斗时所有敌人降低15%伤害\n不灭：当你的气血降低到10%时恢复大量气血，并短时间无视伤害，冷却10分钟\n唯一：将你内力的150%转化为气血",
								},
				};
};

// 每个新敌人进战时施加震慑
this.on_new_enemy = function (me, target) {
				if (target && target.hp > 0) {
								target.add_status({
												id: "changsheng_zhenshe",
												name: "震慑",
												desc: "被长生诀震慑，伤害降低15%",
												duration: 86400000,
												downside: false,
												override: 2,
												only_combat: true,
												prop: { gj_per: -15 },
								}, me);
				}
};

this.on_beginfight = function (me, target) {
				// 首次进战：驱散对方所有增益buff
				if (target && target.status && target.status.length) {
								for (var i = target.status.length - 1; i >= 0; i--) {
												var st = target.status[i];
												if (!st.downside && !st.no_clear) {
																target.remove_status(st.id, true);
												}
								}
				}
};

this.on_force_parry = function (me, from, sh, par) {
				if (me.query_temp("changsheng_hundun") && sh > 0) {
								var cap = Math.floor(me.max_hp * 0.13);
								if (sh > cap) {
												var excess = sh - cap;
												me.do_recover(excess);
												me.add_mp(parseInt(excess));
												me.send_room("<hio>$N的混沌真气将" + excess + "点伤害转化为气血和内力！</hio>");
												return excess;
								}
				}
				return 0;
};

this.on_damage = function (me, from, sh) {
				if (sh <= 0) return sh;
				if (me.query_temp("changsheng_bumie_cd")) return sh;
				var hp_after = me.hp - sh;
				var hp_percent = hp_after / me.max_hp;
				if (me.hp / me.max_hp > 0.1 && (me.hp - sh) <= me.max_hp * 0.1) {
								me.set_temp("changsheng_bumie_cd", 1, 600000);
								var heal = parseInt(me.max_hp * 0.5);
								me.do_recover(heal);
								me.add_status({
												id: "changsheng_bumie",
												name: "不灭",
												desc: "无视所有伤害",
												duration: parseInt(lv * 10),
												downside: false,
												override: 2,
												prop: { diff_sh_per: 9990 + parseInt(lv / 100), diff_sh: 99999999 },
												start_msg: "<hio>$N的长生诀真气爆发，不灭之体护住全身！</hio>",
												finish_msg: "$N的不灭之体消散了。",
								});
								return 0;
				}
				return sh;
};

this.pfm = {
				tiandijue: {
								name: "天地决",
								distime: 60000,
								release_time: 4000,
								enable_skill: "force",
								use_type: 2,
								allow_busy: true,
								mp: 20,
								use: function (me, target, lv) {
												me.send_room("<hio>$N催动长生诀，沟通天地之力，周身笼罩在耀眼的光芒之中！</hio>");
												me.do_recover(me.max_hp);
												me.add_mp(me.max_mp);
												me.clear_downside(true);
												for (var sk_id in me.skills) {
																var player_skill = me.skills[sk_id];
																var sp_skill_id = player_skill.enable_skill || sk_id;
																var sp_skill = SKILL.get(sp_skill_id);
																if (sp_skill && sp_skill.pfm) {
																				for (var pfm_id in sp_skill.pfm) {
																								sp_skill.pfm[pfm_id].change_distime(me, sk_id + "/" + pfm_id);
																				}
																}
												}
												me.notify("<hio>天地之力涌入体内，你感觉气血内力充盈，状态复归巅峰！</hio>");
								},
								query_desc: function (me, lv) {
												return "沟通天地之力，恢复自身全部气血和内力，清除负面状态，并重置所有技能冷却";
								}
				},
				hundunjue: {
								name: "混沌诀",
								distime: 60000,
								release_time: 4000,
								enable_skill: "force",
								mp: 20,
								use: function (me, target, lv) {
												me.send_room("<hio>$N催动长生诀混沌之力，周身笼罩在混沌真气之中！</hio>");
												me.add_status({
																id: "force",
																name: "混沌",
																desc: "单次受伤不超过气血的13%，超过部分转化为气血和内力",
																duration: 3000 + parseInt(lv * 10),
																downside: false,
																override: 2,
																on_attach: function (p) {
																				p.set_temp("changsheng_hundun", 1);
																},
																on_expire: function (p) {
																				p.remove_temp("changsheng_hundun");
																},
																finish_msg: "$N的混沌真气消散了。",
												});
								},
								query_desc: function (me, lv) {
												return "" + (3 + parseInt(lv * 10 / 1000)) + "秒内，你单次受到的伤害不会超过你气血的13%，超过的伤害将转化为你的气血和内力";
								}
				}
};
