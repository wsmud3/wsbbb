this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "铁镐",
    desc: "一根精铁制成的铁镐",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.CLUB（常量不存在 → 装备栏 undefined，装不上）

    weapon_type: WEAPON_TYPE.CLUB,
    hole_count: 4,
    prop: { gj: 539, kuang1: 200 },
});
