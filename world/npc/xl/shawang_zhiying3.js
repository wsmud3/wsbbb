this.inherits(NPC);
this.set({
    name: "杀手之王·无常执影",
    desc: "第三位杀手之王的执念残影——一张不断变化的面孔，你永远看不清他的真面目。他会使用暗器、毒药、易容、剑法——无所不用其极。",
    gender: 0,
    level: 1,
    max_hp: 24000000,
    max_mp: 12000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 210000, mz: 180000, zj: 145000, ds: 145000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2850], ["parry", 2850], ["force", 2850], ["sword", 2850], ["unarmed", 2850],
    ["kuangfengkuaijian", 2850, ["sword", "parry"]], ["huashanxinfa", 2850, "force"], ["feiyanhuixiang", 2850, "dodge"]
);
this.on_die = function(killer) {
    killer.set_temp("zy_xl_3", 1);
    killer.notify('<hig>杀手之王·无常的暗杀记忆涌入你的心神！你领悟了暗杀真意——「刺穴」。</hig>');
};

