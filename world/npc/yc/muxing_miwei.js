this.inherits(NPC);
this.set({
    name: "木行秘卫",
    desc: "木行秘境的强化守卫——被藤蔓缠绕的人形，生命力极其顽强。",
    gender: 0,
    level: 1,
    max_hp: 13000000,
    max_mp: 6500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 145000, mz: 140000, zj: 105000, ds: 105000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["sword", 2500],
    ["sunvjianfa", 2500, ["sword", "parry"]], ["sunvxinfa", 2500, "force"], ["sunvshenfa", 2500, "dodge"]
);
