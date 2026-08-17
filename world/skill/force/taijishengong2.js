this.inherits(SKILL);
this.name = "先天太极";
this.id = "taijishengong2";
this.source_skill = "taijishengong";
this.grade = 5;
this.force_rad = 1.0;
this.family = FAMILIES.WUDANG;
this.desc = "武当派的至高内功心法，太极神功的进阶";
this.can_enables = ["force"];
this.learn_condition = {
				max_mp: 5000,
				skill: { force: 500 }
};
this.query_enable_prop = function (lv) {
				return {
								force: {
												max_hp: 20000,
												fy: 2000,
												zj: 2000,
												fy_per: 6,
												limit_mp: 298000,
												desc: "唯一：将你内力的100%转化为气血"
								}
				};
}
this.pfm = {
				tu:
				{
								name: "真武除邪",
								distime: 60000,
								enable_skill: "force",
								mp: 20,
								use_type: 2,
								release_time: 0,
								use: function (me, target, lv) {
												me.send_room("<hiy>$N闭目凝神，双手抱环划破虚空，周身灵气如指引般汇聚在$P周身，一阴一阳仿若真灵护体。</hiy>");
												me.add_status({
																id: "force",
																name: "真武除邪",
																desc: "先天太极之真武除邪增加你的气血，招架和伤害减免",
																duration: 20000 + parseInt(lv * 10),
																prop: {
																				diff_sh_per2: 32,
																				zj_per: 22 + parseInt(lv / 100),
																				hp_per: 32
																}, on_expire: function (p) {
																				if (p.hp > p.max_hp) {
																								p.hp = p.max_hp;
																								p.notify_hp();
																				}
																}
												});
												me.do_recover(parseInt(me.max_hp * 0.32));
								},
								query_desc: function (me, lv) {
												return"将太极真气运转周身，" + (20 + parseInt(lv * 10 / 1000)) + "秒内增加你32%气血,招架增加" + (22 + parseInt(lv / 100)) + "%,受到的伤害减少32%";
								}
				},
				sanqing:
				{
								name: "一气化三清",
								distime: 50000,
								enable_skill: "force",
								mp: 20,
								use_type: 2,
								release_time: 0,
								use: function (me, target, lv) {
												if (!target) return;
												me.send_room("<hiy>$N深吸一口气，真气运转，霎那间一化为三，三道身影分使不同绝学向$n攻去。</hiy>", target);

												var count = 0;
												var max_count = 3;
												var timer = setInterval(function () {
																if (count >= max_count || me.hp <= 0 || target.hp <= 0) {
																				clearInterval(timer);
																				return;
																}
																var skills = [];
																for (var key in me.skills) {
																				var sk = SKILL.get(key);
																				if (sk && sk.pfm && (sk.can_enables.indexOf("unarmed") !== -1 ||
																								sk.can_enables.indexOf("sword") !== -1 ||
																								sk.can_enables.indexOf("blade") !== -1 ||
																								sk.can_enables.indexOf("club") !== -1 ||
																								sk.can_enables.indexOf("staff") !== -1 ||
																								sk.can_enables.indexOf("whip") !== -1)) {
																								skills.push(sk);
																				}
																}
																if (skills.length > 0) {
																				var sk = skills[me.random(skills.length)];
																				for (var pkey in sk.pfm) {
																								var pfm = sk.pfm[pkey];
																								if (pfm.enable_skill !== "force" && pfm.use_type !== 2) {
																												var old_gj = me.gj;
																												var old_mz = me.mz;
																												me.gj = parseInt(me.gj * 0.7);
																												me.mz = parseInt(me.mz * 0.7);
																												pfm.use(me, target, me.query_skill(sk.id));
																												me.gj = old_gj;
																												me.mz = old_mz;
																												break;
																								}
																				}
																}
																count++;
												}, 6192);
								},
								query_desc: function (me, lv) {
												return"每隔6.192秒化为三清之一使用你目前装备的技能绝招攻击对方，绝招的效果是本身等级的70%。";
								}
				}
};
