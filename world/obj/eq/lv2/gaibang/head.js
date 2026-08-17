this.inherits(EQUIPMENT);
this.set({
    unit: "顶",
    name: "混天冠",
    desc: "一顶上等布料制成的头冠，护佑心神，气贯长虹。",
    grade: 2,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 1,
    group_name: "gb_set_lv2",
    prop: { fy: 76, str: 5 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 15, diff_sh_per: 3 };
    if (count >= 3) return { str: 15 };
    return null;
};
