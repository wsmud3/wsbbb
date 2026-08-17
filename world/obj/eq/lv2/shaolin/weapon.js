this.inherits(EQUIPMENT);
this.set({
    unit: "把",
    name: "罗汉戒刀",
    desc: "一把精铁打造的戒刀，刀身上刻有金刚经文，削铁如泥。",
    grade: 2,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 1,
    group_name: "sl_set_lv2",
    prop: { gj: 65, str: 5 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 3, diff_sh_per: 3 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
