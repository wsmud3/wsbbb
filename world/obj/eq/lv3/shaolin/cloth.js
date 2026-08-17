this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "罗汉僧袍",
    desc: "一件绣有少林标识的僧袍，质地坚韧，佛光暗蕴。",
    grade: 3,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 2,
    group_name: "sl_set_lv3",
    prop: { fy: 220, str: 15, max_hp: 2000 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 5, diff_sh_per: 5 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
