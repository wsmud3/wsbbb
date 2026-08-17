this.inherits(NPC);
this.set({
    name: "洪七公·降龙幻影",
    desc: "洪七公的降龙掌意残影——一尊巨大的金色人影，周身环绕着十八道龙形真气。他虽然是残影，但举手投足间仍有一股玩世不恭的洒脱。",
    gender: 0,
    level: 1,
    max_hp: 37000000,
    max_mp: 18500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 300000, mz: 240000, zj: 195000, ds: 195000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3200], ["parry", 3200], ["force", 3200], ["unarmed", 3200],
    ["xianglongzhang", 3200, ["unarmed", "parry"]], ["huntianqigong", 3200, "force"],
    ["xiaoyaoyou", 3200, "dodge"], ["dagoubang", 3200, "parry"], ["jiaohuabangfa", 3200, "dodge"]
);

this.on_die = function(killer) {
    killer.set_temp("js_boss_defeated", 1);
    killer.notify("<hig>洪七公·降龙幻影消散！你领悟了真意——「降龙真意·二」。</hig>");
    killer.set_temp("zy_js_3", 1);
    killer.set_temp("zy_js_4", 1);
    killer.set_temp("zy_js_5", 1);
};
