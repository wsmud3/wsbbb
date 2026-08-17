this.inherits(NPC);
this.set({
    name: "土行灵",
    desc: "土行殿的守护灵——一道黄褐色的岩石凝聚体，厚重坚固，岿然不动。",
    gender: 0,
    level: 1,
    max_hp: 28000000,
    max_mp: 14000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 185000, mz: 175000, zj: 160000, ds: 160000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["sword", 2800],
    ["sunvjianfa", 2800, ["sword", "parry"]], ["sunvxinfa", 2800, "force"], ["sunvshenfa", 2800, "dodge"]
);

this.on_die = function(killer) {
    killer.notify("<hig>土行灵消散！你领悟了真意——「土行·固」。</hig>");
    killer.set_temp("zy_yc_4", 1);
};
