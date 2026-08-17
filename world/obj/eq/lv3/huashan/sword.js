this.inherits(EQUIPMENT);
this.set({
    unit: "把",
    name: "君子剑",
    desc: "一柄华山精锻长剑，剑走轻灵，出剑如风，君子之器。",
    grade: 3,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 2,
    group_name: "hs_set_lv3",
    prop: { gj: 132, str: 25, mz: 120 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, diff_busy_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
