this.inherits(NPC);
this.set({
    name: "重剑剑灵",
    desc: "一座如铁塔般的黑色巨影，手握一柄玄铁重剑。因为你的献祭，它的气势似乎减弱了一些——但仍不可小觑。",
    gender: 0,
    level: 1,
    max_hp: 22000000,
    max_mp: 11000000,
    no_refresh: true,
    pfm_rate: 0.5,
    prop: { gj: 200000, mz: 170000, zj: 150000, ds: 150000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800],
    ["parry", 2800],
    ["force", 2900],
    ["sword", 2900],
    ["huashanjianfa", 2900, ["sword", "parry"]],
    ["huashanxinfa", 2900, "force"],
    ["feiyanhuixiang", 2800, "dodge"]
);

this.on_die = function (killer) {
    killer.notify("<hig>重剑剑灵轰然倒塌，化作一地玄铁碎片。第三重剑意——「重剑」已融入你的心神。</hig>");
    killer.set_temp("jz_zhongjian", 1);
};
