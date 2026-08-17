this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "真武道袍",
    desc: "一件绣有太极图案的武当道袍，飘逸出尘，仙风道骨。",
    grade: 3,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 2,
    group_name: "wd_set_lv3",
    prop: { fy: 220, int: 15, zj: 100 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, zj_per: 5 };
    if (count >= 3) return { int: 30 };
    return null;
};
