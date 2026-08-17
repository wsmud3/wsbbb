this.inherits(NPC);
this.set({
    name: "降龙守卫",
    desc: "降龙十八掌掌意凝聚成的守卫，形如一道龙形真气，在密室中盘旋游走。它会使用对应密室的那一式降龙掌法。",
    gender: 0,
    level: 1,
    max_hp: 24000000,
    max_mp: 12000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 210000, mz: 190000, zj: 145000, ds: 145000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["unarmed", 2800],
    ["xianglongzhang", 2800, ["unarmed", "parry"]], ["huntianqigong", 2800, "force"], ["xiaoyaoyou", 2800, "dodge"]
);

this.on_die = function(killer) {
    killer.notify("<hig>降龙守卫消散！你领悟了真意——「降龙真意·一」。</hig>");
    killer.set_temp("zy_js_1", 1);
    killer.set_temp("zy_js_2", 1);
};
