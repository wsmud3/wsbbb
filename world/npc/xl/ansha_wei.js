this.inherits(NPC);
this.set({
    name: "暗杀卫",
    desc: "暗殿中的暗影守卫——它在黑暗中来去无踪，只有在出手的一瞬间才会暴露位置。",
    gender: 0,
    level: 1,
    max_hp: 12000000,
    max_mp: 6000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 140000, mz: 140000, zj: 100000, ds: 100000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["sword", 2500],
    ["kuangfengkuaijian", 2500, ["sword", "parry"]], ["huashanxinfa", 2500, "force"], ["feiyanhuixiang", 2500, "dodge"]
);
