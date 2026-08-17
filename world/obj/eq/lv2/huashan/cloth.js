this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "君子青衫",
    desc: "一件上等丝绸缝制的青衫，白衣胜雪，风度翩翩。",
    grade: 2,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 1,
    group_name: "hs_set_lv2",
    prop: { fy: 120, dex: 10 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 3, diff_busy_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
