this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "真武道袍",
    desc: "传说中的真武宝甲，金丝天蚕编织，水火不侵，仙风道骨。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 480, zj: 390, int: 55, dazuo_per: 10 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, zj_per: 10 };
    if (count >= 3) return { int: 100 };
    return null;
};
