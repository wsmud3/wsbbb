this.inherits(NPC);
this.set({
    name: "重剑剑灵",
    desc: "一座如铁塔般的黑色巨影，手握一柄比他本人还高的玄铁重剑。每踏一步，整个大殿都在震颤。它的攻击极其缓慢，但每一次落下都有开山裂石之威。",
    gender: 0,
    level: 1,
    max_hp: 28000000,
    max_mp: 14000000,
    no_refresh: true,
    pfm_rate: 0.5,
    prop: { gj: 280000, mz: 200000, zj: 170000, ds: 160000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3000],
    ["parry", 3000],
    ["force", 3000],
    ["sword", 3000],
    ["huashanjianfa", 3000, ["sword", "parry"]],
    ["huashanxinfa", 3000, "force"],
    ["feiyanhuixiang", 3000, "dodge"]
);

this.on_die = function (killer) {
    killer.notify("<hig>重剑剑灵轰然倒塌，化作一地玄铁碎片。第三重剑意——「重剑」已融入你的心神。</hig>");
    killer.set_temp("jz_zhongjian", 1);
    killer.set_temp("zy_jz_3", 1);
};
