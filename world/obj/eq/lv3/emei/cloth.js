this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "曙光佛衣",
    desc: "一件绣有峨眉标识的佛衣，淡雅素净，如晨曦微光。",
    grade: 3,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 2,
    group_name: "em_set_lv3",
    prop: { fy: 230, max_hp: 1200, con: 15 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 8, diff_fy_per: 5 };
    if (count >= 3) return { con: 30 };
    return null;
};
