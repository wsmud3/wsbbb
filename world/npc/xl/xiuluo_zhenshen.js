this.inherits(NPC);
this.set({
    name: "修罗真身",
    desc: "三位杀手之王的执影融合而成的终极形态——修罗真身。它同时拥有三位杀手之王的全部暗杀技巧。「修罗——非神非鬼，杀中证道。」",
    gender: 0,
    level: 1,
    max_hp: 35000000,
    max_mp: 17000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 300000, mz: 240000, zj: 190000, ds: 190000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3200], ["parry", 3200], ["force", 3200], ["sword", 3200], ["unarmed", 3200],
    ["kuangfengkuaijian", 3200, ["sword", "parry"]], ["huashanxinfa", 3200, "force"], ["feiyanhuixiang", 3200, "dodge"]
);

this.on_die = function(killer) {
    killer.set_temp("xl_boss_defeated", 1);
    killer.set_temp("zy_xl_5", 1);
    killer.notify('<hig>修罗真身消散！你领悟了暗杀真意——「修罗道」。</hig>');
};
