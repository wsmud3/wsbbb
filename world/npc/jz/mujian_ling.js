this.inherits(NPC);
this.set({
    name: "木剑剑灵",
    desc: "一道半透明的枯瘦人影，手中握着一柄看似朽木削成的木剑。它看上去毫不起眼——但越是如此，越令人不安。因为它所代表的，是「不滞于物」的境界。",
    gender: 0,
    level: 1,
    max_hp: 30000000,
    max_mp: 15000000,
    no_refresh: true,
    pfm_rate: 1,
    prop: { gj: 250000, mz: 220000, zj: 180000, ds: 180000 }
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 3100],
    ["parry", 3100],
    ["force", 3100],
    ["unarmed", 3100],
    ["sword", 3100],
    ["huashanjianfa", 3100, ["sword", "parry"]],
    ["huashanxinfa", 3100, "force"],
    ["feiyanhuixiang", 3100, "dodge"],
    ["poyuquan", 3100, "unarmed"]
);

this.on_die = function (killer) {
    killer.notify("<hig>木剑剑灵手中的朽木剑寸寸碎裂，它的人影也随之化作漫天木屑。第四重剑意——「木剑」已融入你的心神。</hig>\n\n<hic>一块深褐色的木片落在你手中——「木剑之心」。</hic>在最终一战中，它将为你免疫一次致命伤害。");
    killer.set_temp("jz_mujian", 1);
    killer.set_temp("zy_jz_4", 1);
};
