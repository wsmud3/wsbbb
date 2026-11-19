
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

// 周年赐福：持续 24 小时（真实时间）。状态本身不存档、死亡时也会被清掉，
// 所以另记一个带过期时间的 temp（随存档保存）。登录时由 USER.restore_item_buffs 按剩余时间补回状态；
// 复活后补回需要复活流程调用同一个函数（女娲石已调用）。
var BUFF_TEMP = "wushen_weizhang_buff", DURATION = 86400000;
this.apply_buff = function (me, duration, silent) {
    if (!(duration > 0)) return false;
    me.add_status({
        id: "wushen_weizhang",
        name: "周年赐福",
        desc: "提高悟性、练习、学习、打坐效率",
        duration: duration,
        override: 2,
        no_clear: true,
        prop: {
            int: 200,
            lianxi_per: 100,
            study_per: 100,
            dazuo_per: 100,
        },
        start_msg: silent ? "" : "\n<HIZ>$N激活了周年庆微章，获得周年赐福！</HIZ>",
        finish_msg: "$N的周年赐福效果消失了。",
    });
    return true;
};
this.on_use = function (me) {
    me.set_temp(BUFF_TEMP, 1, DURATION);
    this.apply_buff(me, DURATION);
    return true;
};
