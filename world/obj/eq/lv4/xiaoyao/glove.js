this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "鲲鹏手印",
    desc: "天外陨铁铸造的拳套，拳风暗含鲲鹏之力，碎石如粉。",
    unit: "双",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.NONE,
    hole_count: 3,
    group_name: "mp_set_lv4",
    prop: { gj: 367, str: 35, mz: 320, gjsd: 5 },
});
this.family = FAMILIES.XIAOYAO;
this.group_prop = function (count) {
    if (count >= 5) return { ds_per: 8, distime_per: 8 };
    if (count >= 3) return { dex: 50 };
    return null;
};
