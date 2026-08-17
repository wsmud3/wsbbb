this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "真武道靴",
    desc: "一双轻便耐磨的道靴，步履轻盈，踏云而行。",
    grade: 2,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 1,
    group_name: "wd_set_lv2",
    prop: { fy: 67, con: 8 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, zj_per: 3 };
    if (count >= 3) return { int: 15 };
    return null;
};
