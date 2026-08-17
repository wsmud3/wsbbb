this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "真武剑",
    desc: "传说中的绝世名剑，剑身铭刻太极符文，剑出如虹，剑气冲霄。",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { gj: 460, str: 55, zj: 500, busy: 3000 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, zj_per: 10 };
    if (count >= 3) return { int: 100 };
    return null;
};
