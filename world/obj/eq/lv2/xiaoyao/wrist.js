this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "鲲鹏护手",
    desc: "一件精铁打造的护手，逍遥派弟子习武时佩戴。",
    grade: 2,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 1,
    group_name: "xy_set_lv2",
    prop: { fy: 30, dex: 5 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 3, distime_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
