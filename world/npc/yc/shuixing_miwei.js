this.inherits(NPC);
this.set({
    name: "水行秘卫",
    desc: "水行秘境的强化守卫——身形如水流般柔韧，极难被击中。",
    gender: 0,
    level: 1,
    max_hp: 12000000,
    max_mp: 6000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 135000, mz: 150000, zj: 110000, ds: 110000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["sword", 2500],
    ["sunvjianfa", 2500, ["sword", "parry"]], ["sunvxinfa", 2500, "force"], ["sunvshenfa", 2500, "dodge"]
);
