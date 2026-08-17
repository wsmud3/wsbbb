this.inherits(NPC);
this.set({
    name: "水行灵",
    desc: "水行殿的守护灵——一道蓝色水流凝聚成的人形，柔韧多变，以柔克刚。",
    gender: 0,
    level: 1,
    max_hp: 24000000,
    max_mp: 12000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 200000, mz: 210000, zj: 150000, ds: 155000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["sword", 2800],
    ["sunvjianfa", 2800, ["sword", "parry"]], ["sunvxinfa", 2800, "force"], ["sunvshenfa", 2800, "dodge"]
);

this.on_die = function(killer) {
    killer.notify("<hig>水行灵消散！你领悟了真意——「水行·润」。</hig>");
    killer.set_temp("zy_yc_2", 1);
};
