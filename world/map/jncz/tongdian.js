this.inherits(ROOM);
this.name = "铜殿";
this.desc = "一座通体铜铸的殿宇，殿门沉重无比，门上没有锁，只靠一股蛮力推动。殿内隐约可见五道身影。";
this.exits = {
    "south": "jncz/zhonglou",
};
this.set_npc([]);

// 原版机制：铜殿推门需要 9000 臂力；推门之后殿内五个护法僧一齐动手。
this.add_action("tuimen", "推开殿门", function (me) {
    if (!me.is_player) return true;
    if (me.query_temp("jncz_tuimen")) {
        me.notify("殿门已经开了。");
        return true;
    }
    var str = me.query_prop ? me.query_prop("str") : 0;
    if (str < 9000) {
        me.notify("<red>殿门纹丝不动，你的臂力（" + str + "）不足 9000，推不开。</red>");
        return true;
    }
    me.set_temp("jncz_tuimen", 1, 7200000);
    me.send_room("$N双臂一沉，沉重的铜门缓缓推开。");
    me.notify("<hir>殿内五个护法僧同时睁眼，齐齐向你扑来！</hir>");
    for (var i = 0; i < 5; i++) {
        var e = NPC.CREATE("jncz/chanseng", this);
        if (e) e.do_kill(me);
    }
    return true;
});

// 五个护法僧全灭后可以取和氏璧
this.add_action("qubi", "取和氏璧", function (me) {
    if (!me.is_player) return true;
    var alive = 0;
    for (var i = 0; i < this.items.length; i++) {
        var o = this.items[i];
        if (o && o.path === "jncz/chanseng" && o.hp > 0) alive++;
    }
    if (alive) {
        me.notify("<red>还有 " + alive + " 个护法僧挡在璧前。</red>");
        return true;
    }
    if (me.query_temp("jncz_heshibi")) {
        me.notify("和氏璧已经在你手上了。");
        return true;
    }
    me.set_temp("jncz_heshibi", 1, 7200000);
    me.add_obj("st/heshibi", 1);
    me.notify("<hig>你取下了和氏璧！回钟楼跳下去，便能进长生门。</hig>");
    return true;
});
