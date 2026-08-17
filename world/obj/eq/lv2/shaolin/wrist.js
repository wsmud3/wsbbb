this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "罗汉护腕",
    desc: "一对精铁护腕，内衬软皮，既可护臂又可增臂力。",
    grade: 2,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 1,
    group_name: "sl_set_lv2",
    prop: { fy: 50, str: 5 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 3, diff_sh_per: 3 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
