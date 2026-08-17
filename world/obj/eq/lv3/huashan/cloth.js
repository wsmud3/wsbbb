this.inherits(EQUIPMENT);
this.set({
    unit: "件",
    name: "君子青衫",
    desc: "一件绣有华山标识的青衫，白衣胜雪，风度翩翩。",
    grade: 3,
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 2,
    group_name: "hs_set_lv3",
    prop: { fy: 220, dex: 15, str: 10 }
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 5, diff_busy_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
