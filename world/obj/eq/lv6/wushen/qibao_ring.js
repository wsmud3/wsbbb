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
				if (me.query_temp("qibao_timer")) return;
				var handler = setInterval(function () {
								if (!me.environment || me.hp <= 0) return;
								var recover = Math.floor(me.max_mp * 5 / 100);
								if (recover > 0 && me.mp < me.max_mp) {
												me.add_mp(recover);
												me.notify("<HIC>七宝指环灵光流转，恢复内力" + recover + "点。</HIC>");
								}
				}, 5000);
				me.set_temp("qibao_timer", handler);
};

this.on_uneq = function (me) {
				var handler = me.query_temp("qibao_timer");
				if (handler) {
								clearInterval(handler);
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
				var handler = me.query_temp("qibao_timer");
				if (handler) {
								clearInterval(handler);
								me.remove_temp("qibao_timer");
				}
				this.on_eq(me);
};
