this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "君子护手",
    desc: "一副精铁打造的护手，华山弟子佩戴，轻便灵活。",
    grade: 3,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 2,
    group_name: "hs_set_lv3",
    prop: { fy: 72, gj: 30, mz: 30 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, diff_busy_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
