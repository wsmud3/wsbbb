this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "鲲鹏长袍",
    desc: "一件上等丝绸缝制的长袍，飘逸灵动，如大鹏展翅。",
    grade: 2,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 1,
    group_name: "xy_set_lv2",
    prop: { fy: 120, ds: 50 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 3, distime_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
