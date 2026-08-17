this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "真武腰带",
    desc: "一条上等丝绸缝制的腰带，束腰运气，内力流转自如。",
    grade: 2,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 1,
    group_name: "wd_set_lv2",
    prop: { fy: 76, con: 5 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, zj_per: 3 };
    if (count >= 3) return { int: 15 };
    return null;
};
