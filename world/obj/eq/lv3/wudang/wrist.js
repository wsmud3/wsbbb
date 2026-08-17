this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "真武护腕",
    desc: "一副精铁打造的护腕，武当弟子佩戴，朴素端庄。",
    grade: 3,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 2,
    group_name: "wd_set_lv3",
    prop: { fy: 72, con: 15, mz: 130 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, zj_per: 5 };
    if (count >= 3) return { int: 30 };
    return null;
};
