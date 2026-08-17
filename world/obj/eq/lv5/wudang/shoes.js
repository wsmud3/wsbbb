this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "真武道靴",
    desc: "传说中的真武神行靴，踏云而行，飘逸灵动。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 320, dex: 30, int: 30, con: 30, diff_sh_per: 5 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, zj_per: 10 };
    if (count >= 3) return { int: 100 };
    return null;
};
