this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "混天麻鞋",
    desc: "传说中的混天神行靴，踏云而行，来去如风。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 320, str: 45, dex: 40, max_hp: 3500, hp_per: 3 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 100, diff_sh_per: 10 };
    if (count >= 3) return { str: 100 };
    return null;
};
