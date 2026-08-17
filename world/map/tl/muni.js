this.inherits(ROOM);
this.name = "牟尼堂";
this.desc = "牟尼堂内，枯荣大师与段誉在此修行，六脉神剑剑气纵横。";
this.exits = { "south": "tl/boruo" };
this.set_npc(["tl/kurongdashi", 1]);
this._spawned = false;

this.on_enter = function(me) {
    if (!me.is_player) return;
    if (this._spawned) return;
    this._spawned = true;
    NPC.CREATE("tl/duanyu", this);
};
