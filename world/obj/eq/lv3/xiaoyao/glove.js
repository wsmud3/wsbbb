this.inherits(EQUIPMENT);
this.set({
    unit: "双",
    name: "鲲鹏手印",
    desc: "一双混铁铸造的拳套，指节镶有尖刺，暗合天地之力。",
    grade: 3,
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.NONE,
    hole_count: 2,
    group_name: "xy_set_lv3",
    prop: { gj: 132, str: 25, mz: 120 }
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 5, distime_per: 5 };
    if (count >= 3) return { dex: 30 };
    return null;
};
