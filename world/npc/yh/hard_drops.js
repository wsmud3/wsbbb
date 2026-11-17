// 移花宫困难模式扫荡的额外掉落表载体（fb23 drop_npcs1 引用），副本里不会刷出这个人物。
// 碧血照丹青只在困难模式掉落：副本内由 yh/midao2 给花无缺实例加上，扫荡由这里提供。
this.inherits(NPC);
this.set({
    name: "花无缺（困难掉落）",
    desc: "移花宫困难模式掉落表。",
    gender: 1,
    age: 22,
    score: 0,
    hp: 1, max_hp: 1
});
this.set_drop({ obj: ["eq/lv5/wushen/bixue_sword"], odds: 30 });
