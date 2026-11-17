this.inherits(ROOM);
this.name = "华山绝顶";
this.desc = "绝壁之上竟是一小块平地，云海就在脚下翻滚，四周再无更高之处。一块大石旁放着一个落满尘土的<span cmd='look xiang'>宝箱</span>，不知是哪一届论剑的胜者留在这里的。";
this.exits = {
    "down": "hslj/tai",
};
this.set_npc([]);

// 五绝打完后爬上来的宝箱（攻略：王重阳和宝箱都有几率掉九阴）。每个副本只能开一次。
this.set_item("xiang", "宝箱", "一个古旧的木箱，箱盖上刻着「天下第一」四个字。", [
    ["open_box", "打开宝箱", function (me) {
        if (!me.is_player) return true;
        if (this.query_temp(me, "hslj_box_opened")) {
            me.notify("宝箱已经空了。");
            return true;
        }
        var a = this.parent;
        if (a && a.hslj_done && !a.hslj_done(this)) {
            me.notify("宝箱纹丝不动，像是被一股内力封住了。");
            return true;
        }
        this.set_temp(me, "hslj_box_opened", 1);
        var items = OBJ.create_by_odds((a && a.HSLJ_BOX) || []);
        var names = [];
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (!it) continue;
            var n = (it.color_name || it.name || "") + (it.count > 1 ? "x" + it.count : "");
            if (me.add_obj(it)) names.push(n);
        }
        me.notify("<hiy>你打开宝箱，" + (names.length ? "得到了：" + names.join("、") + "。" : "里面空空如也。") + "</hiy>");
        return true;
    }]
]);
