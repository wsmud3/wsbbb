this.inherits(COMMAND);
this.command = "say";
this.allow_busy = true;
this.allow_state = true;
this.enter = function (me, msg) {

    if (!msg) {
        return me.send_room("$N在自言自语的说些什么。");
    }
    if (me.query_temp("no_chat")) return me.notify("你目前被禁言中。");
    if (msg.length > 200) return me.notify("你说的太多了。");
    if (msg[0] == "/") {
        if (me.query_temp("admin") || me.query_temp("wiz"))
            return me.command(msg.substr(1));
    }
    if (WORLD.chatlog) WORLD.chatlog.record("say", me, msg, { room: me.room && me.room.path });
    var _sayMsg = UTIL.htmlEncode(UTIL.replace_word(msg));
    me.add_temp('chat2', 1, UTIL.diff_time());
    return me.send_room("$N说：" + UTIL.htmlEncode(_sayMsg));
}