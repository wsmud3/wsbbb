this.inherits(EQUIPMENT);
this.set({
    unit: "根",
    name: "混天棍",
    desc: "一根混铁铸造的长棍，棍身粗重，暗合混天之力。",
    grade: 3,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.STAFF,
    hole_count: 2,
    group_name: "gb_set_lv3",
    prop: { gj: 152, dex: 15, zj: 120 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 30, diff_sh_per: 5 };
    if (count >= 3) return { str: 30 };
    return null;
};
