this.inherits(NPC);
this.set({
    name: "金刚护法",
    desc: "金刚殿的守护者，由金刚之力凝聚而成的怒目金刚，手持降魔杵，威猛无匹。",
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
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["unarmed", 2800],
    ["jingangquan", 2800, "unarmed"], ["yijinjing", 2800, "force"], ["hunyuanyiqi", 2800, "force"],
    ["fuhuquan", 2800, "unarmed"], ["weituogun", 2800, "parry"]
);
this.on_die = function (killer) {
    killer.notify("<hig>金刚护法消散！你领悟了真意——「达摩真意·四」。</hig>");
    killer.set_temp("zy_dmd_4", 1);
};
