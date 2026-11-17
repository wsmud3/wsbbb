this.inherits(ROOM);
this.name = "小厅";
this.desc = "你走进这间小小的厅室, 看到里面放着一张紫檀木茶几和几张湘妃竹椅子，紫檀木的茶几上摆放着茶壶和几只白玉杯，专供客人饮用。你忍不住想坐在竹椅上，让疲惫的身心得到充分的休息。";
this.exits = {
    "west": "yz2/yunjinlou",
};
this.set_npc(["yz2/wangyuyan", 1]);

// 王语嫣要秘籍的回应（按钮来自 yz2/wangyuyan 的「询问还施水阁」）
this.add_action("yz2_give", null, function (me, arg) {
    if (!me || !me.is_player) return true;
    var wyy = this.find_obj_bypath("yz2/wangyuyan");
    if (!wyy || wyy.hp <= 0) { me.notify("王语嫣已经不在这里了。"); return true; }
    if (this.query_temp(me, "yz2_wyy_gift") || this.query_temp(me, "yz2_wyy_refused")) {
        me.notify("王语嫣已经不想再谈这件事了。");
        return true;
    }
    arg = String(arg || "").trim();
    if (!arg || arg === "none") {
        this.set_temp(me, "yz2_wyy_refused", 1);
        me.send_room("$N摇了摇头，没有把秘籍交给王语嫣。");
        me.notify("王语嫣轻轻哼了一声：「不给便不给，我自己去问表哥。」");
        return true;
    }
    var book = null;
    if (me.items) for (var i = 0; i < me.items.length; i++) {
        var it = me.items[i];
        if (it && it.id === arg && String(it.path || "").indexOf("book/") === 0) { book = it; break; }
    }
    if (!book) { me.notify("你身上没有这本秘籍。"); return true; }
    var bname = book.name;
    if (!me.remove_obj(book, 1)) { me.notify("你身上没有这本秘籍。"); return true; }
    this.set_temp(me, "yz2_wyy_gift", 1);
    me.send_room("$N把一本" + bname + "递给了王语嫣。");
    me.notify("王语嫣接过" + bname + "，翻了几页便看得入了神，半晌才抬头道：「多谢。还施水阁就在后厅灵位之后，对着灵位拜上三拜，门户自开。」");
    me.notify("<hig>她又压低声音：「书架最下层有个暗格，表哥最好的几页残谱都藏在那里。」（在还施水阁搜索时可多得一份残页）</hig>");
    return true;
});
