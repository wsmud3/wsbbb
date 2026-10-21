this.inherits(ROOM);
this.name = "绝壁";
this.desc = "论剑台上方一处更加陡峭的绝壁。攀到顶端，竟有一小块被剑削平的石台，台上放着一只古旧的石匣，匣身刻着密密麻麻的经文小字。";
this.exits = { "south": "hslj/tai" };

// [mech] 绝壁之上有个宝箱（攻略：打完之后点岩壁，爬上去，有个宝箱）
this.set_item("baoxiang", "石匣", "一只古旧的石匣，匣身刻满经文小字，其中似乎夹着几页残页。", [
    ["openbox", "打开石匣", null]
]);
this.add_action("openbox", null, function (me, arg) {
    if (!me.is_player) return true;
    if (me.query_temp("hslj_box")) {
        me.notify("石匣已经打开了，里面空空如也。");
        return true;
    }
    me.set_temp("hslj_box", 1);
    me.send_room("$N打开石匣，匣中经页被山风吹得猎猎作响。");
    me.notify("<hio>匣中是一叠九阴真经的残页，字迹古拙。</hio>");
    if (Math.random() < 0.35) {
        me.add_obj("book/bc#jiuyinshengong");
        me.notify("<hig>你从中抽出了一页九阴神功残页！</hig>");
    } else {
        me.add_obj("book/bc#quanzhenjianfa");
        me.notify("<hiy>你从中抽出了一页全真剑法残页。</hiy>");
    }
    me.notify("<hig>华山论剑已了，可回动作栏点「完成副本」结算。</hig>");
    return true;
});
