this.inherits(EQUIPMENT);
this.set({
    unit: "把",
    name: "君子剑",
    desc: "一柄华山精锻长剑，剑走轻灵，出剑如风，君子之器。",
    grade: 2,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 1,
    group_name: "hs_set_lv2",
    prop: { gj: 55, mz: 35 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, diff_busy_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
