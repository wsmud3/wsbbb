this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "曙光束腰",
    desc: "传说中的曙光灵玉腰带，内蕴龙气，运气如虹，内力无尽。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 356, con: 32, int: 30, diff_busy_per: 10, dazuo_per: 10 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 10, diff_fy_per: 10 };
    if (count >= 3) return { con: 100 };
    return null;
};
