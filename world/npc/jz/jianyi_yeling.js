this.inherits(NPC);
this.set({
    name: "剑意野灵",
    desc: "剑冢外围剑意自行凝聚成的灵体，形如一团半透明的青色雾气，隐约可见人形轮廓。它没有意识，只有残留的剑意驱使着它攻击一切闯入者。",
    gender: 0,
    level: 1,
    max_hp: 12000000,
    max_mp: 6000000,
    no_refresh: true,
    pfm_rate: 0.8,
    prop: { gj: 140000, mz: 140000, zj: 100000, ds: 100000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500],
    ["parry", 2500],
    ["force", 2500],
    ["sword", 2500],
    ["huashanjianfa", 2500, ["sword", "parry"]],
    ["huashanxinfa", 2500, "force"],
    ["feiyanhuixiang", 2500, "dodge"]
);
