this.inherits(ROOM);
this.name = "百丈涧";
this.desc = "百丈深涧，铁索横空。一道锈迹斑斑的铁索横跨两岸，下方是云雾缭绕的无底深渊。需身法卓绝（躲闪≥10000）方可攀越，稍有不慎便粉身碎骨。";
this.exits = { "south": "pm/shizuyan" };
this.set_npc([]);

this.add_action("cross_chain", "攀越铁索", function(me) {
    if (me.ds < 10000) {
        me.notify('<red>铁索剧烈摇晃，你的躲闪不足10000，强行攀越必定粉身碎骨！</red>');
        return true;
    }
    if (me.query_temp('pm_carry_tonglao')) {
        me.notify('<hig>你背着童姥，深吸一口气，施展绝顶身法，在铁索上如履平地，稳稳地越过了百丈深涧！</hig>');
        me.notify('童姥在你背上冷哼一声：『哼，还算有点本事。李秋水那贱人就在前面，快去！』');
    } else {
        me.notify('<hig>你施展身法，在铁索上健步如飞，轻松越过了百丈深涧！</hig>');
    }
    me.moveto("pm/xianchoumen", me.name + '攀越铁索离开了。', me.name + '从铁索上攀越而来。');
    return true;
});
