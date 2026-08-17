this.inherits(NPC);
this.set({
    name: "死门守卫", desc: "死门中凝聚的暗影守卫，散发着令人窒息的死亡气息。",
    gender: 0, level: 1, max_hp: 22000000, max_mp: 11000000, no_refresh: true, pfm_rate: 1,
    prop: { gj: 200000, mz: 190000, zj: 150000, ds: 150000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["sword", 2800],
    ["taijijian", 2800, ["sword", "parry"]], ["taijishengong", 2800, "force"], ["tiyunzong", 2800, "dodge"]
);
this.on_die = function (killer) {
    killer.notify("<hig>死门守卫消散！你领悟了真意——「真武剑意·二」。</hig>");
    killer.set_temp("zy_zw_2", 1);
};
