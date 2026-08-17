this.inherits(COMMAND);
this.command = "push_stone_door";
this.allow_busy = true;
this.enter = function(me) {
    var room = me.environment;
    if (!room || room.path !== "jncz/xiewangshiku") return me.notify("这里没有石门。");
    if (room.door_opened) return me.notify("石门已经打开了。");
    if (me.query_prop("str") + me.str < 10000) {
        return me.notify("你的臂力不足10000，无法推开这扇石门。");
    }
    room.door_opened = true;
    me.notify("<hig>你运起全身臂力，沉重地推开了石门！</hig>");
    me.actions = null;
    var npc = NPC.CREATE("jncz/shizhixuan", room);
    if (!npc) return me.notify("石之轩残魂不在此处。");
    if (me.query_status("heshibi_carry")) {
        me.notify("石之轩残魂缓缓睁开了眼，目光如电：「你身上有和氏璧的气息……很好。」");
        me.actions = [{ cmd: "learn_busiyinfa", name: "请教不死印法" }];
    } else {
        me.notify("石之轩残魂瞥了你一眼：「你没有和氏璧，还不够资格。去密室取来和氏璧再来见我。」");
    }
};
