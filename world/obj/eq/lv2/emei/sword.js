this.inherits(EQUIPMENT);
this.set({
    unit: "把",
    name: "曙光剑",
    desc: "一柄峨眉精锻长剑，剑身纤细，剑光如曙光初现。",
    grade: 2,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 1,
    group_name: "em_set_lv2",
    prop: { gj: 55, mz: 35 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 3, diff_fy_per: 3 };
    if (count >= 3) return { con: 15 };
    return null;
};
