this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "君子青衫",
    desc: "天蚕丝编织而成的君子青衫，白衣胜雪，轻若鸿毛。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 320, dex: 20, str: 25, releasetime_per: 5 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 8, diff_busy_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
