this.inherits(EQUIPMENT);
this.set({
    unit: "顶",
    name: "混天冠",
    desc: "一顶精铁铸就的头冠，丐帮弟子佩戴，护佑心神。",
    grade: 3,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 2,
    group_name: "gb_set_lv3",
    prop: { fy: 142, str: 15, mz: 35 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 30, diff_sh_per: 5 };
    if (count >= 3) return { str: 30 };
    return null;
};
