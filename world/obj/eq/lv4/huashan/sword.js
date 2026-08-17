this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "君子剑",
    desc: "一柄绝世好剑，剑走轻灵，出剑如风，君子之器。",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { gj: 300, add_sh_per: 3, str: 35, mz: 320 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, diff_busy_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
