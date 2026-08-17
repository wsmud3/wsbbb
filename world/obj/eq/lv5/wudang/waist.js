this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "真武腰带",
    desc: "传说中的真武灵玉腰带，内蕴龙气，运气如虹，内力无尽。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 355, con: 45, str: 30, expend_mp_per: -10, zj_per: 10 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, zj_per: 10 };
    if (count >= 3) return { int: 100 };
    return null;
};
