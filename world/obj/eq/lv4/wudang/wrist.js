this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "真武护腕",
    desc: "一副玄铁铸造的护腕，武当弟子佩戴，蕴含道家真意。",
    unit: "件",
    eq_type: EQUIP_TYPE.WRIST,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 168, con: 25, mz: 260, busy_per: 5 },
});
this.family = FAMILIES.WUDANG;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, zj_per: 8 };
    if (count >= 3) return { int: 50 };
    return null;
};
