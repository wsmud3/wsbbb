this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "君子头巾",
    desc: "一条灵光流转的君子头巾，正气凛然，护佑心神。",
    unit: "件",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 248, study_per: 15, max_hp: 3000, per: 2 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, diff_busy_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
