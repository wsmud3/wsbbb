this.inherits(NPC);
this.set({
    name: "重剑剑灵",
    desc: "一座如铁塔般的黑色巨影，手握一柄玄铁重剑。因为你的极度献祭，它的气势明显减弱——但这仍是一场硬仗。",
    gender: 0,
    level: 1,
    max_hp: 20000000,
    max_mp: 10000000,
    no_refresh: true,
    pfm_rate: 0.5,
    prop: { gj: 180000, mz: 160000, zj: 140000, ds: 140000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2700],
    ["parry", 2700],
    ["force", 2800],
    ["sword", 2800],
    ["huashanjianfa", 2800, ["sword", "parry"]],
    ["huashanxinfa", 2800, "force"],
    ["feiyanhuixiang", 2700, "dodge"]
);

this.on_die = function (killer) {
    killer.notify("<hig>重剑剑灵轰然倒塌，化作一地玄铁碎片。第三重剑意——「重剑」已融入你的心神。</hig>");
    killer.set_temp("jz_zhongjian", 1);
};
