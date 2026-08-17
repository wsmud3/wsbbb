this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "君子靴",
    desc: "一双疾风般的君子靴，轻便灵活，追风逐电。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 231, dex: 20, diff_busy_per: 5, ds_per: 1 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, diff_busy_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
