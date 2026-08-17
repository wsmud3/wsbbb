this.inherits(NPC);
this.set({
    name: "六阳守卫",
    desc: "天山六阳掌的守护灵——一道炽热的虚影，双掌之间凝聚着至阳至刚的真气。",
    gender: 0,
    level: 1,
    max_hp: 15000000,
    max_mp: 7500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 155000, mz: 145000, zj: 115000, ds: 110000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["unarmed", 2500],
    ["liuyangzhang", 2500, ["unarmed", "parry"]], ["beimingshengong", 2500, "force"], ["lingboweibu", 2500, "dodge"]
);

this.on_die = function(killer) {
    killer.notify("<hig>六阳守卫消散！你领悟了真意——「逍遥真意·六阳」。</hig>");
    killer.set_temp("zy_lhfd_3", 1);
};
