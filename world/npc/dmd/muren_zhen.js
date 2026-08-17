this.inherits(NPC);
this.set({
    name: "木人阵",
    desc: "十八尊木人组成的阵法，动作比铜人更加灵活多变，模拟少林身法步法。",
    gender: 0,
    level: 1,
    max_hp: 12000000,
    max_mp: 6000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 145000, mz: 140000, zj: 105000, ds: 105000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["unarmed", 2500],
    ["jingangquan", 2500, "unarmed"], ["yijinjing", 2500, "force"], ["hunyuanyiqi", 2500, "force"]
);
