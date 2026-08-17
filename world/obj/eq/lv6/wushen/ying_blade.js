
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "鹰刀",
    desc: "破碎虚空后遗留的神器，里面蕴含着无上的武学至理\n特效：鹰击：攻击有几率使敌人昏迷3秒"
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
    },
});

this.do_attack = function (me, target, par) {
    if (target.hp > 0 && !me.query_temp("wushen_ying_cd")) {
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
