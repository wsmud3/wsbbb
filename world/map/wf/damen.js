this.inherits(ROOM);
this.name = "大门";
this.desc = "这里就是成都大户温家的<cmd cmd='look men'>大门</cmd>，门口两个大石狮，威武异常，大门紧锁着，门上的铜环却亮得刺眼。围墙很高，门匾上写着两个烫金的大字“温府”，果然气度不凡。门的旁边有一株<cmd cmd='look tree'>参天大树</cmd>, 人站在下面很是凉快。";
this.exits = {
    "north": "wf/dayuan",
};

// 原版机制：大门锁着，需要从旁边的参天大树跳进去（原版要求 500 级基本轻功）
this.set_item("men", "大门", "两扇朱红大门紧紧锁着，门上的铜环亮得刺眼。", [
    "push", "推门", function (me) {
        me.notify("大门从里面锁着，推不开。");
    }
]);

this.set_item("tree", "大树", "一株参天大树，枝干粗壮，一直伸到围墙上方。", [
    "climb", "跳上去", function (me) {
        // TODO: 原版要求 500 级基本轻功；此处按 query_skill 尽力校验
        var lv = 0;
        try { lv = me.query_skill ? (me.query_skill("dodge") || 0) : 0; } catch (e) { lv = 0; }
        if (lv < 500) {
            me.notify("你的基本轻功不够，爬不上去。");
            return;
        }
        me.send_room("$N纵身跃上大树，翻过围墙落在院中。");
        me.moveto("wf/dating");
    }
]);
