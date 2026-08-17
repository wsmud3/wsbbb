this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "混天冠",
    desc: "一顶灵光流转的混天冠，护佑心神，气贯长虹。",
    unit: "顶",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 248, max_hp: 3500, con: 20, str: 25 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 50, diff_sh_per: 8 };
    if (count >= 3) return { str: 50 };
    return null;
};
