this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "鲲鹏冠",
    desc: "一顶灵光流转的鲲鹏冠，潇洒不羁，尽显逍遥之意。",
    unit: "顶",
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { fy: 248, dex: 27, per: 2, max_mp: 3000 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 8, distime_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
