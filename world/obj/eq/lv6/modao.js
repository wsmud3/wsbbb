
this.inherits(EQUIPMENT);
this.set({
    name: "魔刀",
    desc: "一把漆黑如墨的长刀，刀身隐隐泛着血红色的暗光，散发着令人窒息的杀气。据说此刀曾饮过无数高手的鲜血，刀中蕴含着一股魔性之力。"
    ,
    unit: "把",
    grade: 6,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    value: 500,
    hole_count: 5,
    distime: 300000,
    prop: {
        gj: 180,
        gj_per: 20,
        mz_per: 20,
        distime_per: 15,
        diff_fy_per: 25,
        desc: "入邪：使用后进入入邪状态30分钟，每次攻击恢复2%内力",
    }
});

// 入邪: each attack recovers 2% MP while the buff is active
// 以「入邪」状态本身为准（状态不随存档保存、死亡/驱散时也会一并清除）。旧版用一个不带过期时间的
// temp 标记，temp 会存档，入邪期间下线后标记永久残留、效果变成永久；这里顺手清掉这种残留标记。
function is_ruxie(me) {
    if (me.query_status("modao_ruxie")) return true;
    if (me.query_temp("modao_ruxie")) me.remove_temp("modao_ruxie");
    return false;
}

this.do_attack = function (me, target, par) {
    if (is_ruxie(me)) {
        var recover = Math.floor(me.max_mp * 2 / 100);
        if (recover > 0) me.add_mp(recover);
    }
    return 0;
};

this.on_use = function (me) {
    if (is_ruxie(me)) {
        me.notify("你已经处于入邪状态了。");
        return false; // 未生效，不计冷却
    }

    me.add_status({
        id: "modao_ruxie",
        name: "入邪",
        duration: 1800000,
        override: 2,
        ig_control: true,
        desc: "双眼泛起诡异的红光，每次攻击恢复2%内力",
        start_msg: "\n<hig>$N双眼泛起诡异的红光，一股邪气从魔刀蔓延至全身，整个人仿佛被魔性支配！</hig>",
        finish_msg: "$N眼中的红光渐渐消退，魔刀的邪气也随之散去。",
    });
    return true;
};

this.on_uneq = function (me) {
    if (me.query_status("modao_ruxie")) me.remove_status("modao_ruxie");
    me.remove_temp("modao_ruxie");
};
