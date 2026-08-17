this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "曙光护腕",
    desc: "一副精铁打造的护腕，峨眉弟子佩戴，护腕增力。",
    grade: 3,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 2,
    group_name: "em_set_lv3",
    prop: { fy: 115, mz: 40, zj: 45 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 8, diff_fy_per: 5 };
    if (count >= 3) return { con: 30 };
    return null;
};
