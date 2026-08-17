this.inherits(NPC);
this.set({
    name: "倚天剑灵",
    desc: "倚天剑中沉睡的剑灵——一道优雅的女子虚影，身穿白衣，手持倚天剑。她的眼中蕴含着峨眉历代掌门的记忆与执念。",
    gender: 0,
    level: 1,
    max_hp: 22000000,
    max_mp: 11000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 200000, mz: 190000, zj: 150000, ds: 150000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["sword", 2800], ["unarmed", 2800],
    ["yitianjianfa", 2800, ["sword", "parry"]], ["emeixinfa", 2800, "force"], ["zhutianbu", 2800, "dodge"],
    ["jiuyinbaiguzhao", 2800, "unarmed"], ["jindingzhang", 2800, "unarmed"]
);
this.on_die = function (killer) {
    killer.notify("<hig>倚天剑灵消散！你领悟了真意——「金顶真意·二」。</hig>");
    killer.set_temp("zy_jdfg_2", 1);
};
