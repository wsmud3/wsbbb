this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "鲲鹏冠",
    desc: "传说中的鲲鹏宝冠，紫金铸就，灵光护体，潇洒不羁。",
    unit: "顶",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { fy: 355, dex: 40, max_mp: 6000, expend_mp_per: -10, per: 2 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 10, distime_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
