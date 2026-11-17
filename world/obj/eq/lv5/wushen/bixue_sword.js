this.inherits(EQUIPMENT);
this.set({
				grade: 5,
				name: "碧血照丹青",
				desc: "剑长一尺七寸的墨绿色短剑，骤看似乎没有什么光泽，但若多看两眼，便会觉得剑气森森，逼人眉睫，连眼睛都难睁开。",
				unit: "把",
				eq_type: EQUIP_TYPE.WEAPON,   // 原写 EQUIP_TYPE.SWORD（常量不存在 → 装备栏 undefined，装不上）
				weapon_type: WEAPON_TYPE.SWORD,
				hole_count: 4,
				prop: { gj: 480, mz: 150, mz_per: 10, diff_fy_per: 10, skill: { mingyugong: 100 } },
});
