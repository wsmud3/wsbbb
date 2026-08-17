this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "曙光剑",
    desc: "传说中的绝世名剑，剑身纤细，剑出如虹，剑气冲霄。",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { gj: 490, con: 35, diff_fy_per: 10, mz: 500, gj_per: 10 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 10, diff_fy_per: 10 };
    if (count >= 3) return { con: 100 };
    return null;
};
