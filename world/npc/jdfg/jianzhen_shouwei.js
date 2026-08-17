this.inherits(NPC);
this.set({
    name: "剑阵守卫",
    desc: "峨眉剑阵的守卫者，由三十六柄石剑的剑气凝聚而成。它在剑阵中游走，如鱼得水。",
    gender: 0,
    level: 1,
    max_hp: 12000000,
    max_mp: 6000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 145000, mz: 140000, zj: 105000, ds: 105000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["sword", 2500],
    ["huifengjian", 2500, ["sword", "parry"]], ["emeixinfa", 2500, "force"], ["zhutianbu", 2500, "dodge"]
);
this.on_die = function (killer) {
    killer.notify("<hig>剑阵守卫消散！你领悟了真意——「金顶真意·一」。</hig>");
    killer.set_temp("zy_jdfg_1", 1);
};
