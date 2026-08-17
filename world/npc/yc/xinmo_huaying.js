this.inherits(NPC);
this.set({
    name: "心魔幻影",
    desc: "素心问道台映照出的心魔幻影——它化为你心中最恐惧的形态。它的招式与你如出一辙，却更加狠辣决绝。唯有心境澄明、不为外物所扰者，方能战胜自己的心魔。",
    gender: 0,
    level: 1,
    max_hp: 25000000,
    max_mp: 12500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 220000, mz: 220000, zj: 155000, ds: 155000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2900], ["parry", 2900], ["force", 2900], ["sword", 2900], ["unarmed", 2900],
    ["sunvjianfa", 2900, ["sword", "parry"]], ["sunvxinfa", 2900, "force"], ["sunvshenfa", 2900, "dodge"],
    ["shenxiaojiumie", 2900, "sword"], ["jileliuxing", 2900, "unarmed"]
);

this.on_die = function(killer) {
    killer.set_temp("yc_xinmo_defeated", 1);
    killer.set_temp("zy_yc_6", 1);
    killer.notify("<hig>心魔溃散！你的道心愈发坚定。</hig>");
};
