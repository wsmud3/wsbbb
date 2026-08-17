this.inherits(NPC);
this.set({
    name: "独孤剑意残影",
    desc: "一道纯粹的光，不刺眼但无处不在。它没有固定的形态——有时如剑，有时如人，有时如一缕风。这是剑魔独孤求败留在世间最后的剑意残影。一千年来，它在等待一个能击败它的人。",
    gender: 0,
    level: 1,
    max_hp: 40000000,
    max_mp: 20000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 320000, mz: 250000, zj: 200000, ds: 200000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3300],
    ["parry", 3300],
    ["force", 3300],
    ["sword", 3300],
    ["unarmed", 3300],
    ["dugujiujian", 3300, ["sword", "parry"]],
    ["huashanxinfa", 3300, "force"],
    ["feiyanhuixiang", 3300, "dodge"],
    ["poyuquan", 3300, "unarmed"]
);

// 第一阶段：有招之境 (HP > 40%)，免疫控制，随机使用已偷取的技能
// 第二阶段通过on_heart_beat在room层处理

this.on_die = function (killer) {
    killer.notify("\n<hig>独孤剑意残影化作漫天光雨，如星辰般没入你的体内。</hig>\n\n一道苍老的声音在你心中响起——\n\n「多谢。一千年了，我终于……败了。」\n「这一剑，是我千年所悟。接好了。」\n\n第五重剑意——<hic>「无剑」</hic>已融入你的心神。");
    killer.set_temp("jz_wujian", 1);
    killer.set_temp("zy_jz_5", 1);
};
