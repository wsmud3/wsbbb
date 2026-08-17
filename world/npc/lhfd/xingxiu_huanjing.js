this.inherits(NPC);
this.set({
    name: "星宿幻境",
    desc: "星宿海的幻境守卫——一团毒雾凝聚成的妖兽，不断变换形态。它象征着逍遥派武学中阴暗的一面。",
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
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["unarmed", 2500],
    ["liuyangzhang", 2500, ["unarmed", "parry"]], ["beimingshengong", 2500, "force"], ["lingboweibu", 2500, "dodge"]
);
