this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "混天护腕",
    desc: "一副玄铁铸造的护腕，丐帮弟子习武时佩戴，护腕增力。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 208, mz: 75, gj: 70, max_hp: 3500 },
});
this.family = FAMILIES.GAIBANG;
this.group_prop = function (count) {
    if (count >= 5) return { con: 50, diff_sh_per: 8 };
    if (count >= 3) return { str: 50 };
    return null;
};
