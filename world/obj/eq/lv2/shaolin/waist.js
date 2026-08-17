this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "罗汉腰带",
    desc: "一条牛皮腰带，带扣上刻有降魔杵图案。",
    grade: 2,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 1,
    group_name: "sl_set_lv2",
    prop: { fy: 76, con: 5 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 3, diff_sh_per: 3 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
