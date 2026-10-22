this.inherits(ROOM);
this.name = "大门";
this.desc = "这里是温府的大门，两扇朱红色的大门紧闭，门前一对石狮子威武庄严。院墙很高，墙边有一株参天大树，枝干粗壮，一直伸到围墙上方。";
this.exits = { "south": "wf/dayuan" };
this.set_npc([]);

// 原版机制：门上锁了，需要 500 级基本轻功【跳上树】进府。
this.set_item("tree", "大树", "一株参天大树，枝干伸到围墙上方。", [
    "pa shu", "跳上树", function (me) {
        var lv = me.query_skill("dodge", 0);
        if (lv < 500) {
            me.notify("<red>这棵树太高了，你的基本轻功不到 500 级，怎么也跃不上去。</red>");
            return true;
        }
        me.notify("<hig>你提一口气，攀着树干翻过围墙，落进了温府大院。</hig>");
        me.set_temp("wf_entered", 1, 7200000);
        me.moveto("wf/dayuan", me.name + "攀上大树翻墙进了温府。", me.name + "从墙头翻了下来。");
        return true;
    }
]);
