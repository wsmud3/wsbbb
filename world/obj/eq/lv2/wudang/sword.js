this.inherits(EQUIPMENT);
this.set({
    unit: "把",
    name: "真武剑",
    desc: "一柄武当精锻长剑，剑身铭刻太极符文，出鞘有清吟之声。",
    grade: 2,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 1,
    group_name: "wd_set_lv2",
    prop: { gj: 55, zj: 40 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, zj_per: 3 };
    if (count >= 3) return { int: 15 };
    return null;
};
