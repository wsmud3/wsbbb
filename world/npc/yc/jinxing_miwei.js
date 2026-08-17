this.inherits(NPC);
this.set({
    name: "金行秘卫",
    desc: "金行秘境的强化守卫——全身覆盖着金属质感的铠甲，攻击力极为惊人。",
    gender: 0,
    level: 1,
    max_hp: 12000000,
    max_mp: 6000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 155000, mz: 135000, zj: 100000, ds: 95000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["sword", 2500],
    ["sunvjianfa", 2500, ["sword", "parry"]], ["sunvxinfa", 2500, "force"], ["sunvshenfa", 2500, "dodge"]
);
