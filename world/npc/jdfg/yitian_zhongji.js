this.inherits(NPC);
this.set({
    name: "倚天剑灵·终",
    desc: "倚天剑灵的完全形态——她融合了郭襄的慈悲、风陵师太的遗憾、灭绝师太的决绝。三重人格在她的剑中轮转，每一剑都是一种人生态度。",
    gender: 0,
    level: 1,
    max_hp: 35000000,
    max_mp: 17500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 300000, mz: 250000, zj: 200000, ds: 200000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3200], ["parry", 3200], ["force", 3200], ["sword", 3200], ["unarmed", 3200],
    ["yitianjianfa", 3200, ["sword", "parry"]], ["emeixinfa", 3200, "force"], ["zhutianbu", 3200, "dodge"],
    ["jiuyinbaiguzhao", 3200, "unarmed"], ["jindingzhang", 3200, "unarmed"]
);

this.on_die = function(killer) {
    killer.set_temp("jdfg_boss_defeated", 1);
    killer.notify("<hig>试炼完成！传承的记忆涌入了你的心神。</hig>");
    killer.set_temp("zy_jdfg_5", 1);
};
