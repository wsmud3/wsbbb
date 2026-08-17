this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "混天蓑衣",
    desc: "传说中的混天宝甲，金丝天蚕编织，水火不侵，刚柔并济。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 420, gj_per: 5, gj: 180, con: 30, str: 35 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 100, diff_sh_per: 10 };
    if (count >= 3) return { str: 100 };
    return null;
};
