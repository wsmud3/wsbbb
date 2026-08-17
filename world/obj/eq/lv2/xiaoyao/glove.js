this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "鲲鹏手印",
    desc: "一双精铁打造的拳套，指节镶有尖刺，暗合天地之力。",
    grade: 2,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.NONE,
    hole_count: 1,
    group_name: "xy_set_lv2",
    prop: { gj: 55, str: 10 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 3, distime_per: 3 };
    if (count >= 3) return { dex: 15 };
    return null;
};
