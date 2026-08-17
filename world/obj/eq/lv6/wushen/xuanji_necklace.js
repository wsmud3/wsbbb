
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "璇玑",
    desc: "滉漾明光，仙之至宝\n特效：不灭：当你受到致命一击时不会立即死亡，冷却10分钟"
    ,
    unit: "条",
    eq_type: EQUIP_TYPE.NECKLACE,
    hole_count: 5,
    is_shortcut: true,
    distime: 600000,
    prop: {
        str: 440,
        con: 440,
        dex: 440,
        int: 440,
        per: 8,
    },
});

this.on_use = function (me) {
    me.add_status({
        id: "wushen_xuanji",
        name: "璇玑护体",
        desc: "受到致命一击时不会立即死亡",
        duration: 3000,
        override: 2,
        no_clear: true,
        ig_control: true,
        prop: {
            diff_sh_per2: 1080,
        },
        on_attach: function (who) {
            who.set_temp("\nwushen_xuanji", 1);
        },
        on_expire: function (who) {
            who.remove_temp("wushen_xuanji");
        },
        start_msg: "<HIZ>$N周身浮现出璇玑仙光，北斗七星环绕护体！</HIZ>",
        finish_msg: "$N身上的璇玑仙光渐渐隐去。",
    });
    return true;
};
