this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "曙光剑",
    desc: "一柄绝世好剑，剑身纤细，剑光如曙光初现。",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { gj: 300, diff_fy_per: 5, con: 25, mz: 320 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 50, diff_fy_per: 8 };
    if (count >= 3) return { con: 50 };
    return null;
};
