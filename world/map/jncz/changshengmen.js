this.inherits(ROOM);
this.name = "长生门";
this.desc = "钟楼之下竟别有天地。一扇古拙的石门半掩着，门上刻着「长生」二字，门内温润之气扑面而来。";
this.exits = {};
this.set_npc([]);

// 原版机制：进入长生门即本关完结（盗帅线/僧王线/少帅线共用终点）。
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("jncz_done")) return;
    me.set_temp("jncz_done", 1, 7200000);
    me.add_fbscore(310);
    me.send_room("$N推开长生门，门内一片温润白光。");
    me.notify("<hig>长生门已开，净念禅宗这一趟算是走完了。</hig>");
};
