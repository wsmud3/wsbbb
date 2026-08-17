this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "鲲鹏腰带",
    desc: "传说中的鲲鹏灵玉腰带，内蕴龙气，运气如虹，内力无尽。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 355, dex: 35, max_mp: 4500, dazuo_per: 15, releasetime_per: 10 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 10, distime_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
