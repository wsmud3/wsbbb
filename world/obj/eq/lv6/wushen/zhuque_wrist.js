
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "朱雀骨环",
    desc: "妖神朱雀的遗骨所制的手环，环身火焰缭绕，锋芒毕露"
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
        expend_mp_per: 16,
        add_sh_per: 13,
        desc: "朱雀神力：释放后对敌人造成其已损失气血10%的伤害；敌人气血不高于18%时直接斩杀",
    },
});

// 朱雀神力：造成目标已损失气血 10% 的伤害；目标气血不高于 18% 时直接斩杀。
// 斩杀走 damage2（不计防御、免伤），扣血仍经过 add_hp，免死装备照常生效；处于太极护体的目标不会被斩杀。
var EXECUTE_PER = 18, LOST_PER = 10;
this.on_use = function (me) {
    var target = me.query_enemy();
    if (!target || !(target.hp > 0)) {
        me.notify("你当前没有战斗目标。");
        return false;
    }
    var lostHp = target.max_hp - target.hp;
    var execute = target.max_hp > 0 && target.hp * 100 <= target.max_hp * EXECUTE_PER;
    if (!execute && lostHp <= 0) {
        me.notify("对方气血充盈，朱雀神力无从下手。");
        return false;
    }
    me.send_room("<HIZ>$N手中的朱雀骨环爆发出烈焰，$n被朱雀神火吞噬！</HIZ>", target);
    if (execute && !target._wushen_taiji_invincible) {
        target.damage2(target.hp, me);
        me.send_combat("<HIR>朱雀神火焚尽了$n最后一丝生机！</HIR>\n", target);
    } else {
        var dmg = Math.max(1, Math.floor(lostHp * LOST_PER / 100));
        target.damage(dmg, me, 0);
    }
    if (target.hp <= 0 && me.end_attack) me.end_attack(target);
    return true;
};
