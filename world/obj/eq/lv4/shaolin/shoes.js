this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "罗汉僧鞋",
    desc: "一双疾风般的罗汉僧鞋，踏雪无痕，稳如泰山。",
    grade: 4,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 231, max_hp: 3500, dex: 20, str: 25 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 8, diff_sh_per: 8 };
    if (count >= 3) return { hp_per: 5 };
    return null;
};
