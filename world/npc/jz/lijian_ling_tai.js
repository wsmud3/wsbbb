this.inherits(NPC);
this.set({
    name: "利剑剑灵",
    desc: "利剑剑灵在利剑台上完全显形——一道与你等高的青色剑影，手握青光长剑，剑锋未至而剑气已临。这是利剑境界的真正考验。",
    gender: 0,
    level: 1,
    max_hp: 22000000,
    max_mp: 11000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 200000, mz: 180000, zj: 140000, ds: 140000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800],
    ["parry", 2800],
    ["force", 2800],
    ["sword", 2800],
    ["kuangfengkuaijian", 2800, ["sword", "parry"]],
    ["huashanxinfa", 2800, "force"],
    ["feiyanhuixiang", 2800, "dodge"]
);

this.on_die = function (killer) {
    killer.notify("<hig>利剑剑灵化作漫天青光，消散在黑暗之中。第一重剑意——「利剑」已融入你的心神。</hig>");
    killer.set_temp("jz_lijian", 1);
    killer.set_temp("zy_jz_1", 1);
};
