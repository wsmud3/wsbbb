this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "覆雨剑",
    desc: "长达四尺九寸的长剑，却如破铜烂铁",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.SWORD（常量不存在 → 装备栏 undefined，装不上）

    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 4,
    prop: { gj: 540, mz: 550, gjsd_per: 9, bj_per: 3, diff_fy_per: 5 },
});
