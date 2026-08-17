this.inherits(NPC);
this.set({
    name: "镜中我",
    desc: "铜镜中走出的另一个你——外形与你完全一致，使用你所装备的所有技能。这是琅嬛福地最诡异的考验。",
    gender: 0,
    level: 1,
    max_hp: 24000000,
    max_mp: 12000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 210000, mz: 200000, zj: 145000, ds: 145000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2800], ["parry", 2800], ["force", 2800], ["unarmed", 2800], ["sword", 2800],
    ["liuyangzhang", 2800, ["unarmed", "parry"]], ["beimingshengong", 2800, "force"], ["lingboweibu", 2800, "dodge"],
    ["zhemeishou", 2800, "unarmed"]
);

this.on_die = function(killer) {
    killer.notify("<hig>镜中我破碎！你领悟了真意——「逍遥真意·镜心」。</hig>");
    killer.set_temp("zy_lhfd_4", 1);
};
