this.inherits(ROOM);
this.name = "钟楼";
this.desc = "一座高耸的钟楼，楼中悬着一口巨大铜钟。楼外是深不见底的绝壁，北面通向铜殿。";
this.exits = {
    "east": "jncz/houshanya",
    "north": "jncz/tongdian",
};
this.set_npc([]);

// 原版机制（攻略第 33 节，盗帅线）：拿到和氏璧后回到钟楼，跳楼进入长生门完结。
this.add_action("tiaolou", "跳楼", function (me) {
    if (!me.is_player) return true;
    if (!me.query_temp("jncz_heshibi")) {
        me.notify("<red>还没拿到和氏璧，跳下去只是白送一条命。</red>");
        return true;
    }
    me.send_room("$N抱着和氏璧纵身跃下钟楼。");
    me.moveto("jncz/changshengmen", me.name + "跃下钟楼。", me.name + "从半空中落下。");
    return true;
});
