this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "君子护手",
    desc: "传说中的君子护手，玄铁铸就，轻便灵活，出手如电。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 280, gj: 120, mz: 120, releasetime_per: 10, add_sh_per: 3 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, diff_busy_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
