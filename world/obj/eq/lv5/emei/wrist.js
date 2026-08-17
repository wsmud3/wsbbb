this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "曙光护腕",
    desc: "传说中的曙光金刚护腕，玄铁铸就，护体增力，坚不可摧。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 310, mz: 180, zj: 200, bj_per: 4, bj_per2: 20 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 10, diff_fy_per: 10 };
    if (count >= 3) return { con: 100 };
    return null;
};
