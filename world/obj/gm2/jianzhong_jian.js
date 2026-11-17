// 剑冢剑灵 / 剑魔手中的古剑（副本 NPC 专用，不进任何掉落表）。
// 攻略：剑灵可以「毒钩下武器」，所以剑灵手里要真有一把能被卸下的兵刃。
this.inherits(EQUIPMENT);
this.set({
    grade: 4,
    name: "剑冢古剑",
    desc: "剑冢中插了不知多少年的一柄古剑，剑身斑驳，剑气犹存。",
    unit: "柄",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.SWORD,
    hole_count: 0,
    prop: { gj: 300 }
});
