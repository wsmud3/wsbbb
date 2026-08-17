this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "君子护手",
    desc: "一副玄铁铸造的护手，华山弟子佩戴，轻便灵活。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 168, gj: 60, mz: 60, releasetime_per: 5 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, diff_busy_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
