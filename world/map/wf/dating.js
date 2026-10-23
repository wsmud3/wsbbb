this.inherits(ROOM);
this.name = "大厅";
this.desc = "你来到温家大宅会客的大厅里，这里灯火通明，屋内陈设很是精巧，两个制作精美的有一人般高的大瓷瓶放在厅的两侧，四周的墙上挂着许多文人墨客的字画，大厅上面有块匾，上书“正义堂”三个大字。有个中年人正坐在八仙桌旁悠闲地喝着茶，好象在沉思着什么。";
this.exits = {
    "northwest": "wf/zoulang1",
    "northeast": "wf/zoulang4",
    "south": "wf/dayuan",
};
this.set_npc([]);

// 原版：温方达平时就在大厅里，进门即叫杀。
// 为避免与「木桩聚人」重复（同一个人被生成两次、尸体占分），
// 这里只在玩家还没跳过木桩时生成他；跳过木桩后由木桩统一放出。
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("wf_zhuang_spawned")) return;
    if (this._wf_da_spawned) return;
    for (var i = 0; i < this.items.length; i++) {
        var o = this.items[i];
        if (o && o.path === "wf/wenfangda" && o.hp > 0) return;
    }
    this._wf_da_spawned = true;
    var n = NPC.CREATE("wf/wenfangda", this);
    if (n) {
        me.notify("温方达怒道：哪里来的死牛鼻子，敢擅闯温府 ！");
        n.do_kill(me);
    }
};
