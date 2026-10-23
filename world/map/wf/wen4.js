this.inherits(ROOM);
this.name = "侧房";
this.desc = "这里就是温家老四温方施的住处，据说他在成都口碑不太好，主要是好色，你看，他现在正和一个丫鬟在调情。";
this.exits = {
    "west": "wf/zoulang3",
};
this.set_npc([]);

// 原版：温方施平时就在侧房。跳过木桩后由木桩统一放出，
// 因此这里只在玩家尚未跳过木桩时生成，避免出现两个、尸体占分。
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp("wf_zhuang_spawned")) return;
    if (this._wf_shi_spawned) return;
    for (var i = 0; i < this.items.length; i++) {
        var o = this.items[i];
        if (o && o.path === "wf/wenfangshi" && o.hp > 0) return;
    }
    this._wf_shi_spawned = true;
    NPC.CREATE("wf/wenfangshi", this);
};
