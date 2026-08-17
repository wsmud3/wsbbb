this.inherits(NPC);
this.set({
    name: "心魔·嗔",
    desc: "由闯入者的怒火所化的心魔，形如一团红色火焰，火焰中浮现出仇敌的面孔。",
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
this.on_die = function (killer) {
    killer.notify("<hig>心魔·嗔消散！你领悟了真意——「达摩真意·二」。</hig>");
    killer.set_temp("zy_dmd_2", 1);
};
