this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "曙光护腕",
    desc: "一副精铁打造的护腕，峨眉弟子佩戴，护腕增力。",
    grade: 2,
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 1,
    group_name: "em_set_lv2",
    prop: { fy: 50, mz: 20 }
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 3, diff_fy_per: 3 };
    if (count >= 3) return { con: 15 };
    return null;
};
