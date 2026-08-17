this.inherits(EQUIPMENT);
this.set({
    unit: "把",
    name: "曙光剑",
    desc: "一柄峨眉精锻长剑，剑身纤细，剑光如曙光初现。",
    grade: 3,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 2,
    group_name: "em_set_lv3",
    prop: { gj: 132, con: 15, mz: 120 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 8, diff_fy_per: 5 };
    if (count >= 3) return { con: 30 };
    return null;
};
