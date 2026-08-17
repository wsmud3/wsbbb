this.inherits(NPC);
this.set({
    name: "利剑剑灵",
    desc: "一柄青光长剑化作的人形剑影，身形颀长，浑身笼罩在一层锋锐的青色剑芒之中。它的动作极快，每一次出手都如闪电般凌厉。",
    gender: 0,
    level: 1,
    max_hp: 18000000,
    max_mp: 9000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 170000, mz: 160000, zj: 120000, ds: 120000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2700],
    ["parry", 2700],
    ["force", 2700],
    ["sword", 2700],
    ["kuangfengkuaijian", 2700, ["sword", "parry"]],
    ["huashanxinfa", 2700, "force"],
    ["feiyanhuixiang", 2700, "dodge"]
);
