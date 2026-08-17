this.inherits(ROOM);
this.name = "悬崖边";
this.desc = "缥缈峰的悬崖边上，脚下云雾翻涌，深渊万丈。一道粗壮的铁链从崖壁垂下，直通下方的山顶。需身法卓绝（躲闪≥10000）方可攀爬，否则必定粉身碎骨。";
this.exits = {"north":"pm/shandao2"};
this.set_npc([]);

this.add_action("climb_chain", "攀爬铁链", function(me) {
    if (me.ds < 10000) {
        me.notify('<red>铁链剧烈摇晃，你的躲闪不足10000，强行攀爬必定粉身碎骨！</red>');
        return true;
    }
    me.notify('<hig>你深吸一口气，抓紧铁链，施展绝顶身法稳稳地攀了下去！</hig>');
    me.moveto("pm/shanding", me.name + '攀爬铁链下去了。', me.name + '从铁链上攀了下来。');
    return true;
});
