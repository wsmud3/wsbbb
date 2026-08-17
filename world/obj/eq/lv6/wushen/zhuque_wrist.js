
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "朱雀骨环",
    desc: "妖神朱雀的遗骨所制的手环，环身火焰缭绕，锋芒毕露\n特效：朱雀神力：释放后对敌人造成已损失血量百分比伤害，18%血可斩杀"
    ,
    unit: "只",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 5,
    is_shortcut: true,
    distime: 30000,
    prop: {
        int: 440,
        diff_fy_per: 19,
        mz_per: 19,
        expend_mp_per: -16,
        add_sh_per: 13,
    },
});

this.on_use = function (me) {
    var target = me.query_enemy();
    if (!target) return me.notify("你当前没有战斗目标。");
    var lostHp = target.max_hp - target.hp;
    if (lostHp <= 0) return me.notify("对方气血充盈，无法斩杀。");
    var percent = Math.min(lostHp / target.max_hp * 100, 18);
    if (percent < 18) return me.notify("对方气血尚足，还无法触发斩杀。");
    var dmg = Math.floor(lostHp * 0.1);
    if (dmg <= 0) dmg = 1;
    target.from_attack(dmg, 999999, null,
    "<HIZ>$N手中的朱雀骨环爆发出烈焰，$n被朱雀神火吞噬！</HIZ>");
    return true;
};
