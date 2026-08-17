this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "曙光鞋",
    desc: "传说中的曙光神行靴，踏云而行，如踏朝霞。",
    unit: "双",
    eq_type: EQUIP_TYPE.SHOES,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 356, dex: 32, con: 35, int: 35, max_hp: 3500 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 10, diff_fy_per: 10 };
    if (count >= 3) return { con: 100 };
    return null;
};
