this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "混天麻鞋",
    desc: "一双轻便耐磨的麻鞋，行千里路，鞋底不穿。",
    grade: 2,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 1,
    group_name: "gb_set_lv2",
    prop: { fy: 67, str: 5 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 15, diff_sh_per: 3 };
    if (count >= 3) return { str: 15 };
    return null;
};
