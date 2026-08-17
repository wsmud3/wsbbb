this.inherits(NPC);
this.set({
    name: "白虹守卫",
    desc: "白虹掌力的真气凝聚体——一道白色的虹光，在殿中不断折射转向。它的攻击路线诡异莫测。",
    gender: 0,
    level: 1,
    max_hp: 15000000,
    max_mp: 7500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 150000, mz: 150000, zj: 110000, ds: 120000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["unarmed", 2500],
    ["liuyangzhang", 2500, ["unarmed", "parry"]], ["beimingshengong", 2500, "force"], ["lingboweibu", 2500, "dodge"]
);

this.on_die = function(killer) {
    killer.notify("<hig>白虹守卫消散！你领悟了真意——「逍遥真意·白虹」。</hig>");
    killer.set_temp("zy_lhfd_1", 1);
};
