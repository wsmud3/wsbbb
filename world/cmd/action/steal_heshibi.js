this.inherits(COMMAND);
this.command = "steal_heshibi";
this.allow_busy = true;
this.enter = function(me) {
    if (me.query_status("heshibi_carry")) return me.notify("你身上已经携带了和氏璧的力量。");
    if (me.query_temp("jncz_stolen")) return me.notify("你已经偷取过和氏璧了。");

    me.set_temp("jncz_stolen", 1, 3600000);
    me.notify("<hiy>你悄然将和氏璧收入怀中。一瞬间，一股沉重的压迫感传遍全身！</hiy>");
    me.notify("<red>快离开这里！护宝僧很快就会发现了！</red>");

    me.add_status({
        id: "heshibi_carry",
        name: "<hiw>和氏璧</hiw>",
        duration: 0,
        downside: false,
        desc: "你身上携带着传说中的和氏璧，一股霸道的力量压制着你的修为，全属性下降20%。",
        prop: {
            str_per: -20,
            con_per: -20,
            dex_per: -20,
            int_per: -20
        }
    });
    me.actions = null;
};
