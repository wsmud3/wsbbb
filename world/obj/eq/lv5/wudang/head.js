this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "真武道簪",
    desc: "传说中的真武宝簪，紫金铸就，灵光护体，道法自然。",
    unit: "件",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 355, int: 35, con: 35, distime_per: 10, distime: 1000 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, zj_per: 10 };
    if (count >= 3) return { int: 100 };
    return null;
};
