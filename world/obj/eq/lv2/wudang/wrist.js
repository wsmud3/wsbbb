this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "真武护腕",
    desc: "一副精铁打造的护腕，武当弟子佩戴，朴素端庄。",
    grade: 2,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 1,
    group_name: "wd_set_lv2",
    prop: { fy: 30, con: 5 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, zj_per: 3 };
    if (count >= 3) return { int: 15 };
    return null;
};
