this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "混天护腕",
    desc: "一副精铁护腕，丐帮弟子习武时佩戴，护腕增力。",
    grade: 2,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 1,
    group_name: "gb_set_lv2",
    prop: { fy: 50, mz: 15 }
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 15, diff_sh_per: 3 };
    if (count >= 3) return { str: 15 };
    return null;
};
