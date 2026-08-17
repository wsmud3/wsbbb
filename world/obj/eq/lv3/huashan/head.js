this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "君子头巾",
    desc: "一条精铁镶边的头巾，束发正冠，正气凛然。",
    grade: 3,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 2,
    group_name: "hs_set_lv3",
    prop: { fy: 142, study_per: 15, per: 2 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, diff_busy_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
