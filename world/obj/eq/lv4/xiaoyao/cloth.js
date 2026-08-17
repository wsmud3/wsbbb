this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "鲲鹏长袍",
    desc: "天蚕丝编织而成的鲲鹏长袍，飘逸灵动，如大鹏展翅。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 320, ds: 200, dex: 25, con: 20, releasetime_per: 5 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 8, distime_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
