this.inherits(ROOM);
this.name = "沼泽深处";
this.desc = "沼泽的尽头，乌云压顶，电闪雷鸣。最后一条守护巨龙在此盘踞，南面便是传说中的洪荒古泽。";
this.exits = { "north": "ym/long2", "south": "ym/huangguze" };
this.set_npc(["ym/huolong", 1]);
