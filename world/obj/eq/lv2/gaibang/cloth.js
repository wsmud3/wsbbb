this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "混天蓑衣",
    desc: "一件上等麻布缝制的蓑衣，内衬软甲，刀剑难伤。",
    grade: 2,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 1,
    group_name: "gb_set_lv2",
    prop: { fy: 120, str: 5 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 15, diff_sh_per: 3 };
    if (count >= 3) return { str: 15 };
    return null;
};
