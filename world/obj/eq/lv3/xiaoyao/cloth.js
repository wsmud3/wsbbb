this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "鲲鹏长袍",
    desc: "一件绣有逍遥派标识的长袍，飘逸灵动，如大鹏展翅。",
    grade: 3,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 2,
    group_name: "xy_set_lv3",
    prop: { fy: 220, ds: 150, dex: 10 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 5, distime_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
