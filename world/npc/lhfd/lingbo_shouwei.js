this.inherits(NPC);
this.set({
    name: "凌波守卫",
    desc: "凌波微步廊的守卫——一道飘忽不定的虚影，踩着八卦方位不断移动。要击中它，必须先看穿它的步法。",
    gender: 0,
    level: 1,
    max_hp: 15000000,
    max_mp: 7500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 145000, mz: 155000, zj: 110000, ds: 120000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2500], ["parry", 2500], ["force", 2500], ["unarmed", 2500],
    ["liuyangzhang", 2500, ["unarmed", "parry"]], ["beimingshengong", 2500, "force"], ["lingboweibu", 2500, "dodge"]
);

this.on_die = function(killer) {
    killer.notify("<hig>凌波守卫消散！你领悟了真意——「逍遥真意·凌波」。</hig>");
    killer.set_temp("zy_lhfd_2", 1);
};
