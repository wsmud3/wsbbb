this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "曙光发簪",
    desc: "传说中的曙光宝簪，紫金铸就，灵光护体，灵慧通明。",
    unit: "件",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 356, con: 32, releasetime_per: 20, lianxi_per: 10, max_hp: 4000 },
});
this.family = FAMILIES.EMEI;
this.group_prop = function (count) {
    if (count >= 5) return { hp_per: 10, diff_fy_per: 10 };
    if (count >= 3) return { con: 100 };
    return null;
};
