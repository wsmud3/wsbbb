this.inherits(NPC);
this.set({
    name: "杀手之王·无名执影",
    desc: "第一位杀手之王的执念残影——一个沉默寡言的黑衣人，动作干净利落，没有任何多余的动作。",
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
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["sword", 2800], ["unarmed", 2800],
    ["kuangfengkuaijian", 2800, ["sword", "parry"]], ["huashanxinfa", 2800, "force"], ["feiyanhuixiang", 2800, "dodge"]
);
this.on_die = function(killer) {
    killer.set_temp("zy_xl_1", 1);
    killer.notify('<hig>杀手之王·无名的暗杀记忆涌入你的心神！你领悟了暗杀真意——「影遁」。</hig>');
};

