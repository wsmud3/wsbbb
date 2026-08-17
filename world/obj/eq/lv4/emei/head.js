this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "曙光发簪",
    desc: "一枚灵光流转的曙光发簪，清雅脱俗，蕴含灵慧之气。",
    unit: "件",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 290, con: 21, releasetime_per: 10, lianxi_per: 5 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 50, diff_fy_per: 8 };
    if (count >= 3) return { con: 50 };
    return null;
};
