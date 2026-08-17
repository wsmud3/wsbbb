this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "君子鞶带",
    desc: "传说中的君子灵玉腰带，内蕴龙气，运气如虹，内力无尽。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 355, dex: 45, dazuo_per: 15, diff_busy: 3000 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, diff_busy_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
