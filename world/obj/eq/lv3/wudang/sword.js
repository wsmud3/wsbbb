this.inherits(EQUIPMENT);
this.set({
    unit: "把",
    name: "真武剑",
    desc: "一柄武当精锻长剑，剑身铭刻太极符文，出鞘有清吟之声。",
    grade: 3,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 2,
    group_name: "wd_set_lv3",
    prop: { gj: 132, str: 25, zj: 120 }
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, zj_per: 5 };
    if (count >= 3) return { int: 30 };
    return null;
};
