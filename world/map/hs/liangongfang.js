this.inherits(ROOM);
this.name = "练功房";
this.desc = "这里是恒山派弟子练功的房间，房间中央立着几个练功用的木人。";
this.exits = {
    "south": "hs/donglang",
};
this.set_npc(["hs/npc05", 1], ["hs/npc06", 1]);
