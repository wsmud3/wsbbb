this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "君子靴",
    desc: "传说中的君子神行靴，踏云而行，来去如风。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 320, dex: 40, ds_per: 3, diff_busy_per: 10 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, diff_busy_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
