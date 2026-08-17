this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "真武剑",
    desc: "一柄绝世好剑，剑身铭刻太极符文，出鞘龙吟。",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { gj: 290, str: 35, zj: 320, busy: 1000 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, zj_per: 8 };
    if (count >= 3) return { int: 50 };
    return null;
};
