this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "金刚伏魔杖",
    desc: "佛家神器",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.STAFF（常量不存在 → 装备栏 undefined，装不上）

    weapon_type: WEAPON_TYPE.STAFF,
    hole_count: 4,
    prop: { gj: 616, mz: 605, str: 90, add_sh_per: 2, zj_per: 4 },
});
