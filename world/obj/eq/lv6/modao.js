
this.inherits(EQUIPMENT);
this.set({
    name: "魔刀",
    desc: "一把漆黑如墨的长刀，刀身隐隐泛着血红色的暗光，散发着令人窒息的杀气。据说此刀曾饮过无数高手的鲜血，刀中蕴含着一股魔性之力。\n特效：入邪：使用后进入入邪状态30分钟，每次攻击恢复2%内力"
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
        desc: "入邪"
    }
});

// 入邪: each attack recovers 2% MP while the buff is active
this.do_attack = function (me, target, par) {
    if (me.query_temp("modao_ruxie")) {
        var recover = Math.floor(me.max_mp * 2 / 100);
        if (recover > 0) me.add_mp(recover);
    }
    return 0;
};

this.on_use = function (me) {
    if (me.query_temp("modao_ruxie"))
    return me.notify("你已经处于入邪状态了。");

    me.add_status({
        id: "modao_ruxie",
        name: "入邪",
        duration: 1800000,
        override: 2,
        ig_control: true,
        desc: "双眼泛起诡异的红光，每次攻击恢复2%内力",
        start_msg: "\n<hig>$N双眼泛起诡异的红光，一股邪气从魔刀蔓延至全身，整个人仿佛被魔性支配！</hig>",
        finish_msg: "$N眼中的红光渐渐消退，魔刀的邪气也随之散去。",
        on_attach: function (who) {
            who.set_temp("modao_ruxie", 1);
        },
        on_expire: function (who) {
            who.remove_temp("modao_ruxie");
        }
    });
    return true;
};

this.on_uneq = function (me) {
    if (me.query_temp("modao_ruxie")) {
        me.remove_status("modao_ruxie");
        me.remove_temp("modao_ruxie");
    }
};
