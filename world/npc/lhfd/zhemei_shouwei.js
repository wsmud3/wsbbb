this.inherits(NPC);
this.set({
    name: "折梅守卫",
    desc: "天山折梅手的守护灵——一道优雅的虚影，双手如玉，动作如折梅般轻巧。",
    gender: 0,
    level: 1,
    max_hp: 12000000,
    max_mp: 6000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 140000, mz: 145000, zj: 100000, ds: 110000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["unarmed", 2500],
    ["liuyangzhang", 2500, ["unarmed", "parry"]], ["beimingshengong", 2500, "force"], ["lingboweibu", 2500, "dodge"]
);
