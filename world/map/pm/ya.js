this.inherits(ROOM);
this.name = "断魂崖";
this.desc = "这是通向[灵鹫宫]的必经之路，一条小道蜿蜒曲折地通向缥缈峰顶。路的右侧是一条陡峭的山崖，一阵山风吹过，你似乎听见从下面传来几声惨号，你心中一凛，不禁加快脚步赶紧离开这里。";
this.exits = {
    "northup": "pm/yan",
    "southdown": "pm/shanjiao"
};
this.set_npc(["pm/auto_1", 1], ["pm/bupingdaoren", 1], ["pm/auto_3", 1]);
