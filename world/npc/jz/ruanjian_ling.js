this.inherits(NPC);
this.set({
    name: "软剑剑灵",
    desc: "一道飘忽不定的紫色剑影，身形如蛇蜿蜒，难以捉摸。它的形态每隔片刻就会变幻——有时如长鞭横扫，有时如毒蛇吐信，有时又化作漫天剑花。",
    gender: 0,
    level: 1,
    max_hp: 25000000,
    max_mp: 12000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 220000, mz: 200000, zj: 150000, ds: 150000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2900],
    ["parry", 2900],
    ["force", 2900],
    ["sword", 2900],
    ["huashanjianfa", 2900, ["sword", "parry"]],
    ["huashanxinfa", 2900, "force"],
    ["feiyanhuixiang", 2900, "dodge"]
);

this.on_die = function (killer) {
    killer.notify("<hig>软剑剑灵化作一缕紫烟，缠绕你的指尖后消散。第二重剑意——「软剑」已融入你的心神。</hig>");
    killer.set_temp("jz_ruanjian", 1);
    killer.set_temp("zy_jz_2", 1);
};
