this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "混天棍",
    desc: "玄铁铸就的长棍，棍身刻有龙纹，暗合混天之力。",
    unit: "根",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.STAFF,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { gj: 380, dex: 25, str: 25, zj: 320 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 50, diff_sh_per: 8 };
    if (count >= 3) return { str: 50 };
    return null;
};
