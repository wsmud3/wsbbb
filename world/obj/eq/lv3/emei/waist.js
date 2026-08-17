this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "曙光束腰",
    desc: "一条精铁镶边的束腰，峨眉弟子佩戴，柔韧轻盈，内力流转如溪。",
    grade: 3,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 2,
    group_name: "em_set_lv3",
    prop: { fy: 120, dex: 12, int: 12 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 8, diff_fy_per: 5 };
    if (count >= 3) return { con: 30 };
    return null;
};
