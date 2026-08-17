this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "曙光佛衣",
    desc: "天蚕丝编织而成的曙光佛衣，淡雅素净，如晨曦微光。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 340, max_hp: 2800, con: 25, hp_per: 3 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 50, diff_fy_per: 8 };
    if (count >= 3) return { con: 50 };
    return null;
};
