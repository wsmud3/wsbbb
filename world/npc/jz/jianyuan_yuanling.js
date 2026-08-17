this.inherits(NPC);
this.set({
    name: "剑渊怨灵",
    desc: "一团暗紫色的怨念凝聚成形——这是独孤求败当年以紫薇软剑误伤义士后残留的悔恨。它的形态扭曲不定，发出低沉的呜咽，每一次攻击都带着千年的悲愤。",
    gender: 0,
    level: 1,
    max_hp: 15000000,
    max_mp: 7500000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 160000, mz: 150000, zj: 110000, ds: 110000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2600],
    ["parry", 2600],
    ["force", 2600],
    ["sword", 2600],
    ["huashanjianfa", 2600, ["sword", "parry"]],
    ["huashanxinfa", 2600, "force"],
    ["feiyanhuixiang", 2600, "dodge"]
);

this.on_die = function (killer) {
    killer.notify("<hig>怨灵化作一缕紫烟消散。千年的悔恨终于得以安息。你获得了大量剑意碎片。</hig>");
    killer.add_temp("jz_mark", 2);
};
