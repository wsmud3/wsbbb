this.inherits(EQUIPMENT);
this.set({
    unit: "顶",
    name: "鲲鹏冠",
    desc: "一顶逍遥派弟子佩戴的发冠，潇洒不羁，尽显逍遥之意。",
    grade: 3,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 2,
    group_name: "xy_set_lv3",
    prop: { fy: 142, dex: 17, per: 2 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 5, distime_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
