this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "君子护手",
    desc: "一副精铁打造的护手，华山弟子佩戴，轻便灵活。",
    grade: 2,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 1,
    group_name: "hs_set_lv2",
    prop: { fy: 30, gj: 15 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, diff_busy_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
