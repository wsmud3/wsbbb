this.inherits(ROOM);
this.name = "仙愁门";
this.desc = "这里就快到缥缈峰绝顶了，越往上走，山势越高，缭绕在你身边的白雾愈来愈浓，往南则是下山的路。沿着山道没走几步，在你眼前出现一个石坊，上书『仙愁门』三个大字，概因上山之艰辛吧。";
this.exits = { "north": "pm/dadao", "south": "pm/baizhangjian" };
this.set_npc(["pm/liqiushui", 1]);
