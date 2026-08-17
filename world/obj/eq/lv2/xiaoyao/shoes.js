this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "鲲鹏靴",
    desc: "一双轻便耐磨的布靴，步法轻盈，踏水无痕。",
    grade: 2,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 1,
    group_name: "xy_set_lv2",
    prop: { fy: 67, dex: 5 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 3, distime_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
