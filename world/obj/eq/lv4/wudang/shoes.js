this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "真武道靴",
    desc: "一双疾风般的真武道靴，踏云而行，飘逸灵动。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 231, dex: 20, int: 20, con: 20 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, zj_per: 8 };
    if (count >= 3) return { int: 50 };
    return null;
};
