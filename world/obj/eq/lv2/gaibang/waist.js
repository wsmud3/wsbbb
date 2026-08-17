this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "混天腰带",
    desc: "一条上等布料缝制的腰带，束腰运气，刚柔并济。",
    grade: 2,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 1,
    group_name: "gb_set_lv2",
    prop: { fy: 76, str: 5 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 15, diff_sh_per: 3 };
    if (count >= 3) return { str: 15 };
    return null;
};
