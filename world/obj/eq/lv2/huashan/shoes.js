this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "君子靴",
    desc: "一双轻便耐磨的快靴，轻便灵活，追风逐电。",
    grade: 2,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 1,
    group_name: "hs_set_lv2",
    prop: { fy: 67, dex: 5 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, diff_busy_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
