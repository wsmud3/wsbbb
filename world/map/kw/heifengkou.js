this.inherits(ROOM);
this.name = "黑风口";
this.desc = "关外的黑风口，狂风夹杂着雪粒呼啸而过，这里常有黑熊出没。";
this.exits = { "east": "kw/xiaotianchi", "west": "kw/milin3" };
this.set_npc([]);

// 副本实例里 set_npc 不生成，改为进入时按实例创建（每个实例一只）
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this._kw_bear_spawned) return;
    for (var i = 0; i < this.items.length; i++) {
        var o = this.items[i];
        if (o && o.path === "kw/heixiong" && o.hp > 0) return;
    }
    this._kw_bear_spawned = true;
    NPC.CREATE("kw/heixiong", this);
};
