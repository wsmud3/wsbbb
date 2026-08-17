this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "真武道袍",
    desc: "一件上等丝绸缝制的道袍，飘逸出尘，仙风道骨。",
    grade: 2,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 1,
    group_name: "wd_set_lv2",
    prop: { fy: 120, con: 5 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, zj_per: 3 };
    if (count >= 3) return { int: 15 };
    return null;
};
