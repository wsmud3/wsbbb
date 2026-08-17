this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "鲲鹏靴",
    desc: "一双轻便耐磨的布靴，逍遥派弟子穿着，步法轻盈，踏水无痕。",
    grade: 3,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 2,
    group_name: "xy_set_lv3",
    prop: { fy: 156, dex: 15, ds: 100 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 5, distime_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
