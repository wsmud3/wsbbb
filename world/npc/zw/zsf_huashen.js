this.inherits(NPC);
this.set({
    name: "张三丰·太极化身", desc: "张三丰百年修为凝聚而成的残影，白发白须，身着道袍，周身阴阳二气氤氲流转。他的双眼平和而深邃，仿佛看透了世间一切。",
    gender: 1, level: 1, max_hp: 35000000, max_mp: 17500000, no_refresh: true, pfm_rate: 1,
    prop: { gj: 300000, mz: 250000, zj: 200000, ds: 200000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3200], ["parry", 3200], ["force", 3200], ["sword", 3200], ["unarmed", 3200],
    ["taijijian", 3200, ["sword", "parry"]], ["taijishengong", 3200, "force"],
    ["tiyunzong", 3200, "dodge"], ["taijiquan", 3200, "unarmed"]
);
this.on_die = function (killer) {
    killer.notify("<hig>太极化身化作漫天阴阳二气，融入你的体内。张三丰的声音最后响起：「太极无疆。愿你能走到我不曾到达的彼岸。」</hig>");
    killer.set_temp("zw_complete_flag", 1);
    killer.set_temp("zy_zw_4", 1);
    killer.set_temp("zy_zw_5", 1);
};
