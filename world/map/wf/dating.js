this.inherits(ROOM);
this.name = "大厅";
this.desc = "你来到温家大宅会客的大厅里，这里灯火通明，屋内陈设很是精巧，两个制作精美的有一人般高的大瓷瓶放在厅的两侧，四周的墙上挂着许多文人墨客的字画，大厅上面有块匾，上书“正义堂”三个大字。有个中年人正坐在八仙桌旁悠闲地喝着茶，好象在沉思着什么。";
this.exits = {
    "northwest": "wf/zoulang1",
    "northeast": "wf/zoulang4",
    "south": "wf/dayuan",
};
this.set_npc(["wf/wenfangda", 1]);

// 原版（实测）：进门就遇到温家老大 温方达，主动叫杀。
// 注意：副本房间里 set_npc 静态 NPC 在副本实例中不一定生成，
// 这里改用 on_enter 按实例创建（每间副本房间只生成一次）。
this.on_enter = function (me) {
    if (!me.is_player) return;
    // 兜底：副本实例里若没有静态温方达，则补一个（原版他是静态站在大厅的）
    var found = false;
    for (var i = 0; i < this.items.length; i++) {
        var o = this.items[i];
        if (o && o.path === "wf/wenfangda" && o.hp > 0) { found = true; break; }
    }
    if (found) return;
    if (this._wf_da_done) return;
    this._wf_da_done = true;
    var n = NPC.CREATE("wf/wenfangda", this);
    if (n) { me.notify("温方达怒道：哪里来的死牛鼻子，敢擅闯温府 ！"); n.do_kill(me); }
};
