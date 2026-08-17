this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "真武道簪",
    desc: "一枚精铁铸造的道簪，朴素端庄，蕴含道家真意。",
    grade: 2,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 1,
    group_name: "wd_set_lv2",
    prop: { fy: 76, int: 5 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, zj_per: 3 };
    if (count >= 3) return { int: 15 };
    return null;
};
