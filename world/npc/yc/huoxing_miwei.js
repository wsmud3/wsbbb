this.inherits(NPC);
this.set({
    name: "火行秘卫",
    desc: "火行秘境的强化守卫——全身燃烧着不灭之火，攻击附带灼烧。",
    gender: 0,
    level: 1,
    max_hp: 11000000,
    max_mp: 5500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 160000, mz: 130000, zj: 95000, ds: 90000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["sword", 2500],
    ["sunvjianfa", 2500, ["sword", "parry"]], ["sunvxinfa", 2500, "force"], ["sunvshenfa", 2500, "dodge"]
);
