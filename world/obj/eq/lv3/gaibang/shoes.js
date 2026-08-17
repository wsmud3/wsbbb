this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "混天麻鞋",
    desc: "一双轻便耐磨的麻鞋，丐帮弟子行千里路，鞋底不穿。",
    grade: 3,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 2,
    group_name: "gb_set_lv3",
    prop: { fy: 156, str: 15, con: 15 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 30, diff_sh_per: 5 };
    if (count >= 3) return { str: 30 };
    return null;
};
