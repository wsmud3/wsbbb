this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "君子头巾",
    desc: "传说中的君子宝巾，紫金织就，灵光护体，正气凛然。",
    unit: "件",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 355, study_per: 25, max_hp: 6000, releasetime_per: 10, per: 2 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, diff_busy_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
