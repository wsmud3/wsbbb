this.inherits(ROOM);
this.name = "听雨亭";
this.desc = "一间简朴的竹亭，坐落于竹林最深处。亭中陈设极简，唯有一张古琴与一个蒲团。一位白衣女子正闭目抚琴，琴声悠远清冷，仿佛在诉说着什么。她便是慈航静斋前辈——靳冰云。传闻她已参透慈航剑典最高境界「死关」，周身气息若有若无，似与天地融为一体。";
this.exits = { "east": "cihang/shangyuting", "north": "cihang/siguan" };
this.set_npc([]);
this.npc_spawned = false;

this.on_enter = function (me) {
    if (!me.is_player) return;
    if (this.npc_spawned) return;
    this.npc_spawned = true;
    NPC.CREATE("cihang/jinbingyun", this);
    this.refresh(me);
};
