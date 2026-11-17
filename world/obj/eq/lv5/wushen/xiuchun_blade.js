this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "绣春刀",
    desc: "同一刀鞘的两把短刀，刀身短弯而精悍",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.BLADE（常量不存在 → 装备栏 undefined，装不上）

    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 4,
    prop: { gj: 572, dex: 61, gjsd_per: 5, releasetime_per: 5 },
});
