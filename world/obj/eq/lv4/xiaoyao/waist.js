this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "鲲鹏腰带",
    desc: "一条镶嵌灵玉的鲲鹏腰带，运气顺畅，如鲲鹏扶摇。",
    unit: "条",
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 248, max_mp: 2500, dazuo_per: 10, dex: 25 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 8, distime_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
