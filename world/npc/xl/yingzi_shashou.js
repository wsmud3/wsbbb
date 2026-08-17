this.inherits(NPC);
this.set({
    name: "影子杀手",
    desc: "从你脚下阴影中剥离出的影子杀手——它拥有与你完全相同的战斗本能，却在黑暗中磨炼得更加致命。「战胜自己，方能超越自己。」",
    gender: 0,
    level: 1,
    max_hp: 26000000,
    max_mp: 13000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 230000, mz: 200000, zj: 155000, ds: 155000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2950], ["parry", 2950], ["force", 2950], ["sword", 2950], ["unarmed", 2950],
    ["kuangfengkuaijian", 2950, ["sword", "parry"]], ["huashanxinfa", 2950, "force"], ["feiyanhuixiang", 2950, "dodge"]
);

this.on_die = function(killer) {
    killer.set_temp("xl_yingzi_defeated", 1);
    killer.set_temp("zy_xl_4", 1);
    killer.notify('<hig>影子杀手消散！你领悟了暗杀真意——「血债」。</hig>');
};
