this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "混天护腕",
    desc: "传说中的混天金刚护腕，玄铁铸就，护体增力，坚不可摧。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 305, mz: 145, gj: 150, str: 23, max_hp: 7500 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 100, diff_sh_per: 10 };
    if (count >= 3) return { str: 100 };
    return null;
};
