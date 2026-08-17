this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "君子鞶带",
    desc: "一条上等丝绸缝制的鞶带，君子佩玉，气度不凡。",
    grade: 2,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 1,
    group_name: "hs_set_lv2",
    prop: { fy: 76, dex: 5 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, diff_busy_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
