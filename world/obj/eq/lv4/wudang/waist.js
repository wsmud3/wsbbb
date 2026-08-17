this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "真武腰带",
    desc: "一条镶嵌灵玉的真武腰带，运气顺畅，内力流转如溪。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 248, con: 25, str: 20, zj_per: 5 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, zj_per: 8 };
    if (count >= 3) return { int: 50 };
    return null;
};
