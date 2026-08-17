this.inherits(EQUIPMENT);
this.set({
    unit: "把",
    name: "罗汉戒刀",
    desc: "少林弟子的制式戒刀，刀柄镶有佛珠，刀身寒气逼人。",
    grade: 3,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 2,
    group_name: "sl_set_lv3",
    prop: { gj: 152, str: 25, zj: 120 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 5, diff_sh_per: 5 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
