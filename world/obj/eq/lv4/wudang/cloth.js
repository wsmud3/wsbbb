this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "真武道袍",
    desc: "天蚕丝编织而成的真武道袍，飘逸出尘，仙风道骨。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 320, int: 30, con: 25, zj: 250 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, zj_per: 8 };
    if (count >= 3) return { int: 50 };
    return null;
};
