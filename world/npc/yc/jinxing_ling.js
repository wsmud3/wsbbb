this.inherits(NPC);
this.set({
    name: "金行灵",
    desc: "金行殿的守护灵——一道白金色的剑气凝聚体，锋锐无匹，无坚不摧。",
    gender: 0,
    level: 1,
    max_hp: 22000000,
    max_mp: 11000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 230000, mz: 180000, zj: 140000, ds: 135000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["sword", 2800],
    ["sunvjianfa", 2800, ["sword", "parry"]], ["sunvxinfa", 2800, "force"], ["sunvshenfa", 2800, "dodge"]
);

this.on_die = function(killer) {
    killer.notify("<hig>金行灵消散！你领悟了真意——「金行·锐」。</hig>");
    killer.set_temp("zy_yc_1", 1);
};
