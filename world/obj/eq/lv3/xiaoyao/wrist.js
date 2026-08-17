this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "鲲鹏护手",
    desc: "一件混铁打造的护手，逍遥派弟子习武时佩戴。",
    grade: 3,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 2,
    group_name: "xy_set_lv3",
    prop: { fy: 72, dex: 15, mz: 30 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 5, distime_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
