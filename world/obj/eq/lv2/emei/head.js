this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "曙光发簪",
    desc: "一枚精铁铸造的发簪，清雅脱俗，蕴含灵慧之气。",
    grade: 2,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 1,
    group_name: "em_set_lv2",
    prop: { fy: 80, con: 6 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 3, diff_fy_per: 3 };
    if (count >= 3) return { con: 15 };
    return null;
};
