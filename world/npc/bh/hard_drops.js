// 冰火岛困难模式扫荡的额外掉落表载体（fb22 drop_npcs1 引用），副本里不会刷出这个人物。
// 屠龙刀只在困难模式掉落：副本内由 bh/xiaodong 给谢逊实例加上，扫荡由这里提供。
this.inherits(NPC);
this.set({
    name: "谢逊（困难掉落）",
    desc: "冰火岛困难模式掉落表。",
    gender: 1,
    age: 50,
    score: 0,
    hp: 1, max_hp: 1
});
this.set_drop({ obj: ["eq/lv5/wushen/tulong_blade"], odds: 3680 });
