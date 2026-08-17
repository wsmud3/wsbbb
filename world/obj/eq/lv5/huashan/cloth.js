this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "君子青衫",
    desc: "传说中的君子宝甲，金丝天蚕编织，水火不侵，白衣胜雪。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 420, dex: 35, str: 35, add_sh_per: 500, releasetime_per: 10 },
});
this.family = FAMILIES.HUASHAN;
this.group_prop = function (count) {
    if (count >= 5) return { mz_per: 10, diff_busy_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
