this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "鲲鹏护手",
    desc: "一件玄铁铸造的护手，逍遥派弟子习武时佩戴。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 168, dex: 22, mz: 60, releasetime_per: 5 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 8, distime_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
