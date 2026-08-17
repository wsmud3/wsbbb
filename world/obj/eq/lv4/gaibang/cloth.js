this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "混天蓑衣",
    desc: "天蚕丝编织而成的混天蓑衣，看似粗陋，实则刀枪不入。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 320, gj: 80, con: 20, str: 25 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 50, diff_sh_per: 8 };
    if (count >= 3) return { str: 50 };
    return null;
};
