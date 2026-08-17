this.inherits(ROOM);
this.name = "前院";
this.desc = "一方清净素雅的庭院，院中栽着几株老梅，枝干虬曲苍劲。青石铺就的地面上纤尘不染，显然常年有人精心打理。一位白衣女子正立于梅树下，手持长剑，气质清冷如霜。";
this.exits = { "north": "cihang/zhulin", "south": "cihang/shanmen" };
this.set_npc([]);
this.guard_spawned = false;

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (!this.guard_spawned) {
        this.guard_spawned = true;
        NPC.CREATE("cihang/shifeixuan", this);
        this.refresh(me);
    }
};
