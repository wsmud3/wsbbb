this.inherits(ROOM);
this.name = "天僧禅房";
this.desc = "天僧祖师的禅房，简朴到了极致。四壁空空，唯有一张草席和一个蒲团。天僧祖师盘膝而坐，面容安详，周身佛光隐现。他已在此参禅三百年，武功已臻化境。";
this.exits = { "south": "jncz/houshanya" };
this.set_npc([]);
this.tianseng_spawned = false;

this.on_enter = function(me) {
    if (!me.is_player) return;
    if (!this.tianseng_spawned) {
        this.tianseng_spawned = true;
        NPC.CREATE("jncz/tianseng", this);
    }
};
