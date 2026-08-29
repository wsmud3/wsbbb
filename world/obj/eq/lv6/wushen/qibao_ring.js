this.inherits(EQUIPMENT);
this.set({
				grade: 6,
				name: "七宝指环",
				desc: "逍遥至宝，七宝指环",
				unit: "枚",
				eq_type: EQUIP_TYPE.RING,
				hole_count: 5,
				prop: {
								gj_per: 13,
								mz_per: 13,
								bj_per: 13,
								releasetime: 3744,
								distime: 3744,
								desc: "每5秒恢复5%内力"
				},
});

this.on_eq = function (me) {
				// 兼容旧版：清理误存进 temp 的定时器句柄（会导致存档 JSON 循环引用崩溃）
				if (me.query_temp("qibao_timer")) {
								try { clearInterval(me.query_temp("qibao_timer")); } catch (e) {}
								me.remove_temp("qibao_timer");
				}
				if (me.__qibao_timer) return;
				var item = this;
				var handler = setInterval(function () {
								// 已经卸下装备则停止恢复（修复未装备仍恢复内力的问题）
								if (!me.equipment || me.equipment[item.eq_type] !== item) {
												clearInterval(handler);
												me.__qibao_timer = null;
												return;
								}
								if (!me.environment || me.hp <= 0) return;
								var recover = Math.floor(me.max_mp * 5 / 100);
								if (recover > 0 && me.mp < me.max_mp) {
												me.add_mp(recover);
												me.notify("<HIC>七宝指环灵光流转，恢复内力" + recover + "点。</HIC>");
								}
				}, 5000);
				// 定时器句柄是 Node Timeout 对象，绝不能进 temp（temp 会被序列化存档）
				me.__qibao_timer = handler;
};

this.on_uneq = function (me) {
				if (me.__qibao_timer) {
								clearInterval(me.__qibao_timer);
								me.__qibao_timer = null;
				}
				if (me.query_temp("qibao_timer")) {
								try { clearInterval(me.query_temp("qibao_timer")); } catch (e) {}
								me.remove_temp("qibao_timer");
				}
};

// 登录时刷新角色属性和被动计时器（修复旧版精炼漏洞遗留的脏数据）
this.on_reload = function (me) {
				// 强制刷新装备属性到角色，清除旧代码遗留的refine_count脏数据
				if (me.equipment && me.equipment[this.eq_type] === this) {
								this.change_prop(me, false);
								this.change_prop(me, true);
								me.recount();
				}
				if (me.__qibao_timer) {
								clearInterval(me.__qibao_timer);
								me.__qibao_timer = null;
				}
				if (me.query_temp("qibao_timer")) {
								try { clearInterval(me.query_temp("qibao_timer")); } catch (e) {}
								me.remove_temp("qibao_timer");
				}
				this.on_eq(me);
};
