this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "鲲鹏靴",
    desc: "一双疾风般的鲲鹏靴，步法轻盈，踏水无痕。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 231, dex: 20, ds: 180, ds_per: 2 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 8, distime_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
