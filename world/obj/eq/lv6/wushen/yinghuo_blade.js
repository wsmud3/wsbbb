
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "荧惑",
    desc: "长三尺九寸，刀身漆黑如幽冥，刀刃间隐隐有血光流动\n特效：噬血：使用后5秒内将对敌人造成的伤害吸收为自身气血内力"
    ,
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 5,
    is_shortcut: true,
    distime: 60000,
    prop: {
        gj: 1980,
        str: 330,
        bj_per: 20,
        diff_fy_per: 17,
        add_bjsh_per: 31,
    },
});

this.on_use = function (me) {
    if (me.query_temp("wushen_yinghuo"))
    return me.notify("你已经在荧惑的嗜血状态中了。");

    me.add_status({
        id: "wushen_yinghuo",
        name: "嗜血",
        desc: "将造成的伤害吸收为气血内力",
        duration: 5000,
        override: 2,
        no_clear: true,
        on_attach: function (who) {
            who.set_temp("\nwushen_yinghuo", 1);
            who.send_room("<HIZ>$N手中荧惑刀身血光大盛，进入嗜血状态！</HIZ>");
        },
        on_expire: function (who) {
            who.remove_temp("wushen_yinghuo");
            who.send_room("$N身上的血光渐渐消散。");
        },
    });
    return true;
};

this.do_attack = function (me, target, par) {
    if (me.query_temp("wushen_yinghuo") && target.hp > 0) {
        var sh = Math.floor(me.query_prop("gj") * 0.3);
        if (sh > 0) {
            me.add_hp(Math.floor(sh * 0.5));
            me.add_mp(Math.floor(sh * 0.5));
        }
        return sh;
    }
    return 0;
};
