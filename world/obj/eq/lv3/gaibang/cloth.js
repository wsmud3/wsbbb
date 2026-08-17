this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "混天蓑衣",
    desc: "一件绣有丐帮标识的蓑衣，质地坚韧，暗藏韧劲。",
    grade: 3,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 2,
    group_name: "gb_set_lv3",
    prop: { fy: 220, str: 15, con: 10 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 30, diff_sh_per: 5 };
    if (count >= 3) return { str: 30 };
    return null;
};
