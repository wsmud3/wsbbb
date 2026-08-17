this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "鲲鹏手印",
    desc: "传说中的神拳套，暗含鲲鹏变化之道，拳意通神，扶摇万里。",
    unit: "双",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.NONE,
    hole_count: 4,
    group_name: "mp_set_lv5",
    prop: { gj: 458, str: 55, releasetime_per: 10, mz: 500, gjsd: 10 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 10, distime_per: 10 };
    if (count >= 3) return { dex: 100 };
    return null;
};
