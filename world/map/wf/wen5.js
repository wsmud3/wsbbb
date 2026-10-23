this.inherits(ROOM);
this.name = "侧房";
this.desc = "这里就是温家老五温方南的住处，他是个爱附庸风雅的人，正拿着本诗集摇头晃脑地读着。";
this.exits = {
    "west": "wf/zoulang4",
};
this.set_npc([]);

// 原版：温方南平时就在侧房。跳过木桩后由木桩统一放出。
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("wf_zhuang_spawned")) return;
    if (this._wf_nan_spawned) return;
    for (var i = 0; i < this.items.length; i++) {
        var o = this.items[i];
        if (o && o.path === "wf/wenfangnan" && o.hp > 0) return;
    }
    this._wf_nan_spawned = true;
    NPC.CREATE("wf/wenfangnan", this);
};
