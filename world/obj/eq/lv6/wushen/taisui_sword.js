
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "太岁",
    desc: "天下百万共剑主监兵佩剑，锈迹斑斑，但锋锐之感直逼面庞"
    ,
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 5,
    is_shortcut: true,
    distime: 120000,
    prop: {
        gj: 1980,
        str: 330,
        gj_per: 17,
        gjsd_per: 27,
        diff_fy_per: 20,
        desc: "太岁：消耗自身所有气血内力，对敌人造成巨额伤害",
    },
});

this.on_use = function (me) {
    if (me.hp <= 1 && me.mp <= 1) {
        me.notify("你的气血和内力都已耗尽，无法施展兵解。");
        return false;
    }
    var target = me.query_enemy();
    if (!target) {
        me.notify("你当前没有战斗目标。");
        return false;
    }
    var dmg = me.hp + me.mp;
    me.set_hp(1);
    me.set_mp(1);
    target.from_attack(dmg, 999999, null,
    "<HIZ>$N施展兵解之术，气血内力归一，化作惊天一击轰向$n！</HIZ>");
    return true;
};
