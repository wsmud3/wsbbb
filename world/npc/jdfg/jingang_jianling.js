this.inherits(NPC);
this.set({
    name: "金刚剑灵",
    desc: "怒目金刚的剑意化身——一道金色的剑气凝聚体，散发着威严不可侵犯的气势。",
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
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["sword", 2800],
    ["huifengjian", 2800, ["sword", "parry"]], ["emeixinfa", 2800, "force"], ["zhutianbu", 2800, "dodge"]
);
this.on_die = function (killer) {
    killer.notify("<hig>金刚剑灵消散！你领悟了真意——「金顶真意·三」。</hig>");
    killer.set_temp("zy_jdfg_3", 1);
};
