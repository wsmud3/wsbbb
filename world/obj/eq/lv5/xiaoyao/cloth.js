this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "鲲鹏长袍",
    desc: "传说中的鲲鹏宝甲，金丝天蚕编织，水火不侵，如大鹏展翅。",
    unit: "件",
    eq_type: EQUIP_TYPE.CLOTH,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 420, ds_per: 5, dex: 35, con: 30, releasetime_per: 10 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 10, distime_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
