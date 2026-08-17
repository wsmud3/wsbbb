this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "曙光护腕",
    desc: "一副玄铁铸造的护腕，峨眉弟子佩戴，护腕增力。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 210, mz: 100, zj: 100, bj_per: 2 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 50, diff_fy_per: 8 };
    if (count >= 3) return { con: 50 };
    return null;
};
