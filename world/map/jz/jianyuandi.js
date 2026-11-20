this.inherits(ROOM);
this.name = "剑渊谷底";
this.desc = "剑渊底部是一片潮湿的碎石地，头顶只有一线天光。紫薇软剑的残骸散落在碎石之间——剑身早已锈蚀，但残片中仍蕴含着一缕紫色剑意，在黑暗中微微发光。更深处的阴影中，似乎盘踞着一股怨念——那是以此剑误伤义士后残留的千年之悔。";
this.exits = { "west": "jz/jianyuanpan" };

this.on_create = function () {
    this.set_npc("jz/jianyuan_yuanling", 1);
};

this.set_item("jz_ziweicanpian", "紫薇软剑残片", "软剑虽已锈蚀，残片中仍蕴含一缕紫色剑意，在黑暗中幽幽发光。", ["拾取残片"]);

this.add_action("pick_fragment", "拾取残片", function (me) {
    if (me.query_temp("jz_jianyuan_done")) return me.notify("你已经拾取过残片了。");
    me.set_temp("jz_jianyuan_done", 1);
    me.notify("<hig>你小心翼翼地拾起紫薇软剑的残片。一股剑意充斥着丹田，你感到对剑的领悟更深一层！</hig>");
    // 紫薇剑意：5 分钟内受到剑魔（剑冢第五关独孤求败）的伤害降低 20%（含真实伤害）
    me.add_status({
        id: "jz_ziwei", name: "紫薇剑意", desc: "一股剑意充斥着丹田，你感到对剑的领悟更深一层！",
        duration: 300000, override: 2, no_clear: true,
        on_damage: function (owner, from, sh) {
            if (from && from.is_zhenyi_trial && from.trial_key === "jz" && from.trial_id === 5) return Math.floor(sh * 0.8);
            return sh;
        }
    });
});
