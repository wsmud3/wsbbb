this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "鲲鹏靴",
    desc: "传说中的鲲鹏神行靴，踏云而行，踏水无痕。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 320, dex: 40, ds_per: 5, ds: 280, diff_busy_per: 10 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 10, distime_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
