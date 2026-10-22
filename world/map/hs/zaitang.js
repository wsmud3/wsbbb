this.inherits(ROOM);
this.name = "斋堂";
this.desc = "这里便是恒山白云庵的斋堂。斋堂里摆满了长长的餐桌和长凳，几位小师太正在忙碌的布置素斋，南面通往白云庵西廊。";
this.exits = {
    "south": "hs/xilang",
};
this.set_npc("hs/npc07");   // 恒山派弟子 仪光
this.set_npc("hs/npc08");   // 恒山派弟子 仪和
