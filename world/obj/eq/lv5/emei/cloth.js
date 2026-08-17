this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "曙光佛衣",
    desc: "传说中的曙光宝甲，金丝天蚕编织，水火不侵，如晨曦护体。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 450, max_hp: 4500, con: 36, hp_per: 10, diff_sh_per: 5 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 10, diff_fy_per: 10 };
    if (count >= 3) return { con: 100 };
    return null;
};
