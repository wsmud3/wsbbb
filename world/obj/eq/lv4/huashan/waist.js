this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "君子鞶带",
    desc: "一条镶嵌灵玉的君子鞶带，运气顺畅，君子之仪。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 248, dex: 25, dazuo_per: 10, diff_busy: 1000 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, diff_busy_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
