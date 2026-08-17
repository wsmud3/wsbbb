this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "罗汉腰带",
    desc: "一条镶嵌灵玉的罗汉腰带，运气顺畅，内力源源不绝。",
    grade: 4,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 248, max_hp: 3500, con: 20, dazuo_per: 8 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 8, diff_sh_per: 8 };
    if (count >= 3) return { hp_per: 5 };
    return null;
};
