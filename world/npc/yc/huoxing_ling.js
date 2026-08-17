this.inherits(NPC);
this.set({
    name: "火行灵",
    desc: "火行殿的守护灵——一道赤红色的火焰凝聚体，炽热暴烈，焚尽万物。",
    gender: 0,
    level: 1,
    max_hp: 21000000,
    max_mp: 10500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 240000, mz: 175000, zj: 135000, ds: 130000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["sword", 2800],
    ["sunvjianfa", 2800, ["sword", "parry"]], ["sunvxinfa", 2800, "force"], ["sunvshenfa", 2800, "dodge"]
);

this.on_die = function(killer) {
    killer.notify("<hig>火行灵消散！你领悟了真意——「火行·灼」。</hig>");
    killer.set_temp("zy_yc_3", 1);
};
