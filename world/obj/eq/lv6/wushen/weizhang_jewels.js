
this.inherits(EQUIPMENT);
this.set({
    grade: 6,
    name: "周年庆微章",
    desc: "武神传说周年纪念微章\n特效：周年赐福：使用后24小时内提高悟性、练习、学习、打坐效率"
    ,
    unit: "个",
    eq_type: EQUIP_TYPE.JEWELS,
    hole_count: 5,
    is_shortcut: true,
    distime: 600000,
    prop: {
        int: 29,
        lianxi_per: 40,
        study_per: 40,
        dazuo_per: 40,
    },
});

this.on_use = function (me) {
    me.add_status({
        id: "wushen_weizhang",
        name: "周年赐福",
        desc: "提高悟性、练习、学习、打坐效率",
        duration: 86400000,
        override: 2,
        no_clear: true,
        prop: {
            int: 200,
            lianxi_per: 100,
            study_per: 100,
            dazuo_per: 100,
        },
        start_msg: "\n<HIZ>$N激活了周年庆微章，获得周年赐福！</HIZ>",
        finish_msg: "$N的周年赐福效果消失了。",
    });
    return true;
};
