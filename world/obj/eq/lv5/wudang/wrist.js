this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "真武护腕",
    desc: "传说中的真武金刚护腕，玄铁铸就，护体增力，坚不可摧。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 280, con: 38, mz: 320, max_hp: 4000, busy_per: 10 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, zj_per: 10 };
    if (count >= 3) return { int: 100 };
    return null;
};
