this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "君子靴",
    desc: "一双轻便耐磨的快靴，华山弟子穿着，追风逐电。",
    grade: 3,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 2,
    group_name: "hs_set_lv3",
    prop: { fy: 156, dex: 15, diff_busy_per: 2 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, diff_busy_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
