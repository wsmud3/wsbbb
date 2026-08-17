this.inherits(EQUIPMENT);
this.set({
    unit: "把",
    name: "罗汉戒刀",
    desc: "少林秘传宝刀，刀身铭刻金刚经，刀气纵横，斩妖除魔。",
    grade: 4,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { gj: 380, max_hp: 3500, str: 35, zj: 320 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 8, diff_sh_per: 8 };
    if (count >= 3) return { hp_per: 5 };
    return null;
};
