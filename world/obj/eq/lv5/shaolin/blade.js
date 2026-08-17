this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "罗汉戒刀",
    desc: "传说中的佛门神兵，刀身铭刻大藏经全文，佛光普照，万邪不侵。",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { gj: 560, gj_per: 10, str: 55, zj: 500 },
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 10, diff_sh_per: 10 };
    if (count >= 3) return { max_hp: 100 };
    return null;
};
