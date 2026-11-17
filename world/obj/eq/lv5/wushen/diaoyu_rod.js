this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "钓鱼竿",
    desc: "一根竹子制成的钓鱼竿",
    unit: "根",
    eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.STAFF（常量不存在 → 装备栏 undefined，装不上）

    weapon_type: WEAPON_TYPE.STAFF,
    hole_count: 4,
    prop: { gj: 539 },
});
