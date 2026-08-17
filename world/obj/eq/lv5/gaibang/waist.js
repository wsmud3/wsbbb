this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "混天腰带",
    desc: "传说中的混天灵玉腰带，内蕴龙气，运气如虹，内力无尽。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 355, str: 35, con: 30, diff_busy: 2000 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 100, diff_sh_per: 10 };
    if (count >= 3) return { str: 100 };
    return null;
};
