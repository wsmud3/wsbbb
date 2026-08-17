this.inherits(NPC);
this.set({
    name: "土行秘卫",
    desc: "土行秘境的强化守卫——由最坚硬的岩石构成，防御力远超常理。",
    gender: 0,
    level: 1,
    max_hp: 14000000,
    max_mp: 7000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 130000, mz: 130000, zj: 120000, ds: 120000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["sword", 2500],
    ["sunvjianfa", 2500, ["sword", "parry"]], ["sunvxinfa", 2500, "force"], ["sunvshenfa", 2500, "dodge"]
);
