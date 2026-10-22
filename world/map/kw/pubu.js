this.inherits(ROOM);
this.name = "瀑布";
this.desc = "一道瀑布从悬崖上飞流直下，水声轰鸣。此处山势险峻，据说瀑布之后别有洞天。";
this.exits = { "west": "kw/xiaotianchi" };

// [mech] 大清龙脉（攻略：地图的最东方可以挖大清龙脉，需集齐 8 本四十二章经、基础轻功 300）
this.set_item("longmai", "龙脉", "瀑布后方的岩壁裂开一道缝隙，缝口凿着八道锁扣，缝内隐隐有龙气透出。", [
    ["wa", "挖掘龙脉", null]
]);

this.add_action("wa", null, function (me, arg) {
    if (!me.is_player) return true;
    if (me.query_temp("kw_longmai_done")) {
        me.notify("龙脉已被你挖开，此处只剩空空的石缝。");
        return true;
    }
    var lv = 0;
    try { lv = me.query_skill("dodge") || 0; } catch (e) { lv = 0; }
    if (lv < 300) {
        me.notify("<hir>裂隙在半崖之上，你的基本轻功不到 300 级，攀不上去。</hir>");
        return true;
    }
    var found = [], i;
    if (me.items) {
        for (i = 0; i < me.items.length; i++) {
            var it = me.items[i];
            if (it && it.path && it.path.indexOf("sp/bj/jing#") === 0) found.push(it);
        }
    }
    if (found.length < 8) {
        me.notify("<hir>八道锁扣严丝合缝，须集齐八本四十二章经方能开启。你身上只有 " + found.length + " 本。</hir>");
        return true;
    }
    var need = 8;
    for (i = 0; i < found.length && need > 0; i++) {
        me.remove_obj(found[i]);
        need--;
    }
    me.set_temp("kw_longmai_done", 1);
    me.send_room("$N将八本四十二章经嵌入锁扣，岩壁轰然中裂，一股龙气冲天而起。");
    me.notify("<hio>八经合璧，大清龙脉在你手下被掘开！</hio>");
    var books = ["book/bc#hujiadaofa", "book/book#sixiangbu", "book/bc#lengyueshengong"];
    me.add_obj(books[Math.floor(Math.random() * books.length)]);
    me.add_obj("money/gold", 5 + Math.floor(Math.random() * 6));
    me.add_obj("res/xiongdan");
    me.notify("<hig>你从龙脉中掘出一本秘籍与若干黄金、物资。</hig>");
    return true;
});
