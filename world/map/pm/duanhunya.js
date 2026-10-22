this.inherits(ROOM);
this.name = "断魂崖";
this.desc = "断魂崖之上，乌道老大和不平道人正围攻天山童姥。";
this.exits = { "north": "pm/shizuyan", "south": "pm/shanjiao" };
this.set_npc([]);
this._spawned = false;

// 原版：童姥以「女童」形态出现在断魂崖，被乌老大、不平道人围攻。
// 救下她之后（或至少杀退两人），才能用「背负童姥」把她背过百丈涧的铁索。
this.on_enter = function(me) {
    if (!me.is_player) return;
    if (this._spawned) return;
    this._spawned = true;
    NPC.CREATE("pm/wudaolaoda", this);
    NPC.CREATE("pm/bupingdaoren", this);
    var tonglao = NPC.CREATE("pm/tianshantonglao", this);
    if (tonglao) {
        tonglao.no_fight = true;
        me.notify('<hiy>一个八九岁的女童被乌道老大和不平道人围攻，眼看就要撑不住了！</hiy>');
        me.notify('<hiy>（杀退这两人后，可用「背负童姥」把她背过百丈涧的铁索。）</hiy>');
    }
};
