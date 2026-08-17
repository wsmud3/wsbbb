this.inherits(NPC);
this.set({
    name: "无崖子·残念",
    desc: "无崖子留在琅嬛福地中的残念——一道模糊的白色虚影，英俊的面容已随岁月模糊。他会使用你所有的技能——以彼之道，还施彼身。",
    gender: 0,
    level: 1,
    max_hp: 37000000,
    max_mp: 18500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 300000, mz: 250000, zj: 195000, ds: 200000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3200], ["parry", 3200], ["force", 3200], ["unarmed", 3200], ["sword", 3200],
    ["liuyangzhang", 3200, ["unarmed", "parry"]], ["beimingshengong", 3200, "force"], ["lingboweibu", 3200, "dodge"],
    ["zhemeishou", 3200, "unarmed"]
);

this.on_die = function(killer) {
    killer.set_temp("lhfd_boss_defeated", 1);
    killer.notify("<hig>无崖子·残念消散！你领悟了真意——「逍遥真意·无崖」。</hig>");
    killer.set_temp("zy_lhfd_5", 1);
};
