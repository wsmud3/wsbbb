this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "君子头巾",
    desc: "一条上等布料制成的头巾，束发正冠，正气凛然。",
    grade: 2,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 1,
    group_name: "hs_set_lv2",
    prop: { fy: 76, study_per: 5 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, diff_busy_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
