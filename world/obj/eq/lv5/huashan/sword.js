this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "君子剑",
    desc: "传说中的绝世名剑，剑走轻灵，剑出如虹，剑气冲霄。",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { gj: 490, str: 55, add_sh_per: 6, mz: 500, gj_per: 10 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, diff_busy_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
