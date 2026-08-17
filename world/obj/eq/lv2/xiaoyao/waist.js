this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "鲲鹏腰带",
    desc: "一条上等丝绸缝制的腰带，轻若无物，运气如鲲鹏扶摇。",
    grade: 2,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 1,
    group_name: "xy_set_lv2",
    prop: { max_mp: 500, fy: 76 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 3, distime_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
