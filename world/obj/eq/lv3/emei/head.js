this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "曙光发簪",
    desc: "一枚精铁铸造的发簪，清雅脱俗，蕴含灵慧之气。",
    grade: 3,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 2,
    group_name: "em_set_lv3",
    prop: { fy: 186, con: 12, releasetime_per: 5 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 8, diff_fy_per: 5 };
    if (count >= 3) return { con: 30 };
    return null;
};
