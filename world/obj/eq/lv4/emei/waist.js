this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "曙光束腰",
    desc: "一条镶嵌灵玉的曙光束腰，运气顺畅，内力流转如溪。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 235, con: 21, int: 21, diff_busy_per: 5 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 50, diff_fy_per: 8 };
    if (count >= 3) return { con: 50 };
    return null;
};
