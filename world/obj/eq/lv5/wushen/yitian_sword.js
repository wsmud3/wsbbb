this.inherits(EQUIPMENT);
this.set({
				grade: 5,
				name: "倚天剑",
				desc: "武林至尊，宝刀屠龙。号令天下，莫敢不从。倚天不出，谁与争锋！这就是号令天下的倚天剑",
				unit: "把",
				eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.SWORD（常量不存在 → 装备栏 undefined，装不上）
				weapon_type: WEAPON_TYPE.SWORD,
				hole_count: 4,
				prop: {
								gj: 500,
								int: 60,
								add_sh_per: 6,
								bj_per: 4,
								desc: "攻击时有几率无视对方防御",
				},
});

// 特效「攻击时有几率无视对方防御」：每次出手 5% 几率追加一剑，伤害为攻击力的 1.5 倍，
// 走 damage(sh, from, 100)——diff_fy=100 即「破防 100%」，对方的防御与伤害减免都按 0 计算，
// 与真意「崩岳」的无视防御伤害同一写法。例外：对方免伤已 ≥100%（无敌类 buff 如龙魂丹、
// 刻意免疫的 NPC）时只按普通规则结算，「无视防御」不等于击穿无敌。
// 整段包在 try/catch 里：武器钩子在自动攻击定时器里执行，抛出的异常会让整个进程退出。
this.do_attack = function (me, target, par) {
				try {
								if (!target || !(target.hp > 0) || Math.random() >= 0.05) return 0;
								var dmg = Math.floor((me.gj || 0) * 1.5);
								if (!(dmg > 0)) return 0;
								var diff_fy = (target.diff_sh_per || 0) >= 100 ? 0 : 100;
								me.send_combat("<HIY>$N手中的倚天剑锋芒一闪，剑气凌厉无匹，$n的防御顿时形同虚设！</HIY>\n", target);
								var sh = target.damage(dmg, me, diff_fy) || 0;
								if (sh > 0) me.send_combat("<HIY>倚天剑气破防造成" + Math.floor(sh) + "点伤害。</HIY>\n", target);
				} catch (e) {
								console.error("yitian_sword do_attack error:", e && e.stack || e);
				}
				return 0;
};
