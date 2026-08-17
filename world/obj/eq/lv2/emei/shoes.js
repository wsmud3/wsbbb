this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "曙光鞋",
    desc: "一双轻便耐磨的布鞋，步履轻盈，如踏朝霞。",
    grade: 2,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 1,
    group_name: "em_set_lv2",
    prop: { fy: 80, dex: 6 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 3, diff_fy_per: 3 };
    if (count >= 3) return { con: 15 };
    return null;
};
