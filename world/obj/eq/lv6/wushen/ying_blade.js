
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "鹰刀",
    desc: "破碎虚空后遗留的神器，里面蕴含着无上的武学至理"
    ,
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 5,
    is_shortcut: true,
    prop: {
        gj: 1936,
        dex: 440,
        gj_per: 17,
        bj_per: 17,
        diff_fy_per: 20,
        desc: "鹰击：攻击时有20%几率使敌人昏迷3秒，触发后15秒内不会再次触发",
    },
});

this.do_attack = function (me, target, par) {
    // 有几率触发（20%），触发后 15 秒内不再触发
    if (target.hp > 0 && !me.query_temp("wushen_ying_cd") && Math.random() < 0.2) {
        me.set_temp("wushen_ying_cd", 1, 15000);
        target.add_status({
            id: "wushen_ying",
            name: "<HIZ>昏迷</HIZ>",
            desc: "你昏迷不醒",
            is_faint: true,
            duration: 3000,
            downside: true,
            start_msg: "\n<HIZ>$n被$N的鹰刀击中，眼前一黑昏了过去！</HIZ>",
            finish_msg: "<hiy>$N晃了晃头，清醒了过来。</hiy>",
        }, me);
    }
    return 0;
};
