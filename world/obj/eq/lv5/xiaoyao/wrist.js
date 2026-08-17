this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "鲲鹏护手",
    desc: "传说中的鲲鹏护手，玄铁铸就，轻若无物，出手如电。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 280, dex: 30, mz: 120, releasetime_per: 10, distime_per: 2 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 10, distime_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
