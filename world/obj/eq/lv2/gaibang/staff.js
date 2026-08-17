this.inherits(EQUIPMENT);
this.set({
    unit: "根",
    name: "混天棍",
    desc: "一根精铁铸就的长棍，棍身粗重，舞动时虎虎生风。",
    grade: 2,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.STAFF,
    hole_count: 1,
    group_name: "gb_set_lv2",
    prop: { gj: 65, dex: 5 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 15, diff_sh_per: 3 };
    if (count >= 3) return { str: 15 };
    return null;
};
