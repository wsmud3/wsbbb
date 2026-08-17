this.inherits(EQUIPMENT);
this.set({
    unit: "条",
    name: "罗汉腰带",
    desc: "一条皮质腰带，带扣为铜铸罗汉像，可助打坐修禅。",
    grade: 3,
    eq_type: EQUIP_TYPE.WAIST,
    hole_count: 2,
    group_name: "sl_set_lv3",
    prop: { fy: 142, con: 15, dazuo_per: 5 }
});
this.family = FAMILIES.SHAOLIN;
this.group_prop = function (count) {
    if (count >= 5) return { fy_per: 5, diff_sh_per: 5 };
    if (count >= 3) return { hp_per: 3 };
    return null;
};
