this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "混天腰带",
    desc: "一条镶嵌灵玉的混天腰带，运气顺畅，刚柔并济。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 248, max_hp: 3500, con: 20, str: 25 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 50, diff_sh_per: 8 };
    if (count >= 3) return { str: 50 };
    return null;
};
