// 血刀老祖手中的血刀（副本 NPC 专用，不进入任何掉落表）。
// 注意：玩家装备 eq/lv5/wushen/xuedao_blade 写的是 EQUIP_TYPE.BLADE（该常量不存在 → eq_type 为 undefined），
// 装不到武器栏上；老祖要能被「卸下兵刃」（折梅手 / 独孤九剑破字诀 / 五毒钩法），必须真正拿在武器栏里，
// 所以单独做一把 NPC 用的。血魔加成（每杀一人 +4000 攻命）的逻辑在 world/area/fb1/fb29.js。
this.inherits(EQUIPMENT);
this.set({
    grade: 5,
    name: "血刀",
    desc: "血刀老祖的随身兵刃，刀身暗红，犹有血迹。传说此刀每饮一人之血，刀上血光便盛一分。",
    unit: "把",
    eq_type: EQUIP_TYPE.WEAPON,
    weapon_type: WEAPON_TYPE.BLADE,
    hole_count: 0,
    prop: {
        gj: 430,
        mz: 400
    }
});
