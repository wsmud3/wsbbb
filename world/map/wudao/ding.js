this.inherits(ROOM);
this.name = "塔顶"
this.desc = "这里是武道塔的顶部，脚下是高耸入云的武道塔，你仿佛踏在云端，果然是会当凌绝顶，一览众山小。";
this.exits = {
    "west": "wudao/west", "up": "wudao/ta100", "down": "wudao/men",
    "east": "wudao/east", "north": "wudao/north", "south": "wudao/south"
};
this.on_leave = function (me, dir) {
    if (dir === "up") {
        var level = me.query_temp("wd_level", 0);
        if (level >= 100) {
            me.moveto('wudao/ta2');
        } else {
            me.moveto('wudao/ta100');
        }
        return false;
    }
}
this.on_before_enter = function (me) {
    this.room_exits_json = null;
    var npc = this.find_by_path("pub/wudao_taizhu");
    if (!npc) {
        npc = NPC.CLONE("pub/wudao_taizhu");
        npc.environment = this;
        for (var i = this.items.length - 1; i >= 0; i--) {
            if (!this.items[i].is_player) {
                this.items.splice(i, 1);
            }
        }
        this.items.push(npc);
        this.item_changed(npc, true);
        this.refresh();
    }
}
