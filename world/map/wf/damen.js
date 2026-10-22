this.inherits(ROOM);
this.name = "大门";
this.desc = "这里就是成都大户温家的<cmd cmd='look men'>大门</cmd>，门口两个大石狮，威武异常，大门紧锁着，门上的铜环却亮得刺眼。围墙很高，门匾上写着两个烫金的大字“温府”，果然气度不凡。门的旁边有一株<cmd cmd='look tree'>参天大树</cmd>, 人站在下面很是凉快。";
this.exits = {};
this.set_npc([]);

// 原版：大门紧锁，north 走不进去（服务端回「这扇门是紧闭着的，要不想办法翻墙过去吧。」）
// 大门锁死：没有 north 出口，只能 climb 翻墙（原版 go north 回「这扇门是紧闭着的…」）
this.add_action("north", null, function (me) {
    me.notify("这扇门是紧闭着的，要不想想别的办法翻墙过去吧。");
    return true;
});

// 原版：门（点开看的对象）
this.set_item("men", "大门", "这扇门紧紧闭着，门上的铜环被摸得发亮。", []);

// 原版：大树（描述只是风味，实际用 climb 爬上树翻墙）
this.set_item("tree", "参天大树", "这是一株上百年龄的老树，枝叶依然十分茂盛，看来是爬不上去的。", []);

// 原版机制：在古树前 climb（需要 500 级基本轻功），翻过高墙落入大院。
this.add_action("climb", "翻墙", function (me) {
    if (!me.is_player) return true;
    var lv = me.query_skill("dodge", 0);
    if (lv < 500) {
        me.notify("<red>围墙太高，你的基本轻功不到 500 级，跃不上去。</red>");
        return true;
    }
    me.send_room("$N在古树前深深地吸了口气，猛地跃了起来。只见$N足尖在树枝上一点,飞身跃过高墙，已悠然飘落院中。");
    me.moveto("wf/dayuan");
    return true;
});
