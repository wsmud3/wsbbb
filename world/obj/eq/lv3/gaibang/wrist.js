this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "混天护腕",
    desc: "一副精铁打造的护腕，丐帮弟子习武时佩戴，护腕增力。",
    grade: 3,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 2,
    group_name: "gb_set_lv3",
    prop: { fy: 112, mz: 25, gj: 20 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 30, diff_sh_per: 5 };
    if (count >= 3) return { str: 30 };
    return null;
};
