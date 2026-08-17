this.inherits(NPC);
this.set({
    name: "九天玄女·化身",
    desc: "九天玄女留在瑶池中的一缕化身——她全身笼罩在五彩光芒之中，五种属性的真元在她手中如臂使指。她几乎免疫单一属性攻击——只有以五行相生相克的原理才能有效克制她。",
    gender: 0,
    level: 1,
    max_hp: 40000000,
    max_mp: 20000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 320000, mz: 260000, zj: 210000, ds: 210000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3400], ["parry", 3400], ["force", 3400], ["sword", 3400], ["unarmed", 3400],
    ["sunvjianfa", 3400, ["sword", "parry"]], ["sunvxinfa", 3400, "force"], ["sunvshenfa", 3400, "dodge"],
    ["shenxiaojiumie", 3400, "sword"], ["jileliuxing", 3400, "unarmed"]
);

this.on_die = function(killer) {
    killer.set_temp("yc_boss_defeated", 1);
    killer.set_temp("zy_yc_7", 1);
    killer.notify("<hig>试炼完成！传承的记忆涌入了你的心神。</hig>");
};
