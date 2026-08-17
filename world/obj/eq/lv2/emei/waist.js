this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "曙光束腰",
    desc: "一条上等丝绸缝制的束腰，柔韧轻盈，内力流转如溪。",
    grade: 2,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 1,
    group_name: "em_set_lv2",
    prop: { fy: 45, dex: 6 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 3, diff_fy_per: 3 };
    if (count >= 3) return { con: 15 };
    return null;
};
