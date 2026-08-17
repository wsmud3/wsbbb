this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "真武道簪",
    desc: "一枚灵光流转的真武道簪，蕴含道家真意，护佑心神。",
    unit: "件",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 248, int: 25, con: 20, distime_per: 5 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, zj_per: 8 };
    if (count >= 3) return { int: 50 };
    return null;
};
