this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "混天冠",
    desc: "传说中的混天宝冠，紫金铸就，灵光护体，气贯长虹。",
    unit: "顶",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 355, str: 35, con: 30, hp_per: 3 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 100, diff_sh_per: 10 };
    if (count >= 3) return { str: 100 };
    return null;
};
