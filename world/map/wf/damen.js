this.inherits(ROOM);
this.name = "大门";
this.desc = "这里就是成都大户温家的<cmd cmd='look men'>大门</cmd>，门口两个大石狮，威武异常，大门紧锁着，门上的铜环却亮得刺眼。围墙很高，门匾上写着两个烫金的大字“温府”，果然气度不凡。门的旁边有一株<cmd cmd='look tree'>参天大树</cmd>, 人站在下面很是凉快。";
this.exits = {
    "north": "wf/dating",
};
this.set_npc([]);

// 原版机制（攻略第 11 节）：大门锁着，需要 500 级基本轻功【跳上树】翻墙进府。
this.set_item("tree", "大树", "一株参天大树，枝干伸到围墙上方。", [
    ["pa shu", "跳上树", function (me) {
        var lv = me.query_skill("dodge", 0);
        if (lv < 500) {
            me.notify("<red>这棵树太高了，你的基本轻功不到 500 级，怎么也跃不上去。</red>");
            return true;
        }
        me.notify("<hig>你提一口气，攀着树干翻过围墙，落进了温府大院。</hig>");
        me.moveto("wf/dayuan", me.name + "攀上大树翻墙进了温府。", me.name + "从墙头翻了下来。");
        return true;
    }]
]);
