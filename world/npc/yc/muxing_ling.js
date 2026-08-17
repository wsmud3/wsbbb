this.inherits(NPC);
this.set({
    name: "木行灵",
    desc: "木行殿的守护灵——一道翠绿色的藤蔓凝聚体，生生不息，韧性十足。",
    gender: 0,
    level: 1,
    max_hp: 25000000,
    max_mp: 12500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 210000, mz: 200000, zj: 145000, ds: 145000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["sword", 2800],
    ["sunvjianfa", 2800, ["sword", "parry"]], ["sunvxinfa", 2800, "force"], ["sunvshenfa", 2800, "dodge"]
);

this.on_die = function(killer) {
    killer.notify("<hig>木行灵消散！你领悟了真意——「木行·缚」。</hig>");
    killer.set_temp("zy_yc_5", 1);
};
