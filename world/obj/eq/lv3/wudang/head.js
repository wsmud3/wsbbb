this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "真武道簪",
    desc: "一枚精铁铸造的道簪，朴素端庄，蕴含道家真意。",
    grade: 3,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 2,
    group_name: "wd_set_lv3",
    prop: { fy: 142, int: 15, con: 10 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, zj_per: 5 };
    if (count >= 3) return { int: 30 };
    return null;
};
