this.inherits(EQUIPMENT);
this.set({
    unit: "顶",
    name: "鲲鹏冠",
    desc: "一顶逍遥派弟子佩戴的发冠，潇洒不羁，尽显逍遥之意。",
    grade: 2,
    eq_type: EQUIP_TYPE.HEAD,
    hole_count: 1,
    group_name: "xy_set_lv2",
    prop: { fy: 76, dex: 7 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 3, distime_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
