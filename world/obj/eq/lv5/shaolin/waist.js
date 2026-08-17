this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "罗汉腰带",
    desc: "传说中的佛门灵玉腰带，内蕴佛光，运气如虹，内力无尽。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 355, str: 35, con: 30, dazuo_per: 10 },
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 10, diff_sh_per: 10 };
    if (count >= 3) return { max_hp: 100 };
    return null;
};
