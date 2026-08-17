this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "鲲鹏腰带",
    desc: "一条混铁镶边的腰带，逍遥派弟子佩戴，运气如鲲鹏扶摇。",
    grade: 3,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 2,
    group_name: "xy_set_lv3",
    prop: { fy: 142, max_mp: 1500, dazuo_per: 5 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 5, distime_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
