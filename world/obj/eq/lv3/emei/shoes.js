this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "曙光鞋",
    desc: "一双轻便耐磨的布鞋，峨眉弟子穿着，步履轻盈，如踏朝霞。",
    grade: 3,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 2,
    group_name: "em_set_lv3",
    prop: { fy: 186, dex: 12, con: 12 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 8, diff_fy_per: 5 };
    if (count >= 3) return { con: 30 };
    return null;
};
