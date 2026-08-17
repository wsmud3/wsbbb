this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "真武道靴",
    desc: "一双轻便耐磨的道靴，武当弟子穿着，步履轻盈，踏云而行。",
    grade: 3,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 2,
    group_name: "wd_set_lv3",
    prop: { fy: 156, con: 15, int: 12 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, zj_per: 5 };
    if (count >= 3) return { int: 30 };
    return null;
};
