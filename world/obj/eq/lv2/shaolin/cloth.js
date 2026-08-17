this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "罗汉僧袍",
    desc: "一件上等布料缝制的僧袍，内衬软甲，刀剑难伤。",
    grade: 2,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 1,
    group_name: "sl_set_lv2",
    prop: { fy: 120, str: 5 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 3, diff_sh_per: 3 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
