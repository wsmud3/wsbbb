this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "曙光佛衣",
    desc: "一件上等丝绸缝制的佛衣，淡雅素净，如晨曦微光。",
    grade: 2,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 1,
    group_name: "em_set_lv2",
    prop: { fy: 120, max_hp: 500 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 3, diff_fy_per: 3 };
    if (count >= 3) return { con: 15 };
    return null;
};
