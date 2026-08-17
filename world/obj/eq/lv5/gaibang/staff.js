this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "混天棍",
    desc: "传说中的神棍，玄铁铸就，暗合混天之力，横扫千军如卷席。",
    unit: "根",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.STAFF,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { gj: 560, gj_per: 10, str: 35, dex: 35, zj_per: 5 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 100, diff_sh_per: 10 };
    if (count >= 3) return { str: 100 };
    return null;
};
