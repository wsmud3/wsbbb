this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "罗汉僧鞋",
    desc: "一双纳底僧鞋，鞋帮绣有佛门万字，行走无声，稳如磐石。",
    grade: 3,
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 2,
    group_name: "sl_set_lv3",
    prop: { fy: 156, str: 15, max_hp: 2000 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 5, diff_sh_per: 5 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
