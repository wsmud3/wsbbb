this.inherits(ROOM);
this.name = "失足岩";
this.desc = "这是通向『灵鹫宫』的必经之路，山道被一块如鹰喙突出的巨岩截断，巨岩光可鉴人，只有中间凿出了一条窄窄的石阶通向山道的那一头。你小心翼翼地试着踏了上去，心想：我能过去吧。";
this.exits = {
    "northup": "pm/jian",
    "southdown": "pm/ya"
};
this.set_npc(["pm/zhuobufan", 1]);
