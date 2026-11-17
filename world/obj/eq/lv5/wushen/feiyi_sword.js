this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "飞翼剑",
    desc: "身无彩凤双飞翼，心有灵犀一点通",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.SWORD（常量不存在 → 装备栏 undefined，装不上）

    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 4,
    prop: { gj: 538, int: 66, practice_per: 33 },
});
