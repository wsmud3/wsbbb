this.inherits(ROOM);
this.name = "厢房";
this.desc = "这是一间乱糟糟的厢房，里面到处都是各种大大小小的笼子、瓦罐之类的东西。不时能看到有毒虫在笼子里面上窜下跳，四处游走。一个赤着膀子的白胡子老者正在手忙脚乱的给毒虫们挨个喂食，忙得手忙脚乱。 ";
this.exits = {
    "east": "wudu/nanyuan",
};
this.set_npc("wudu/bairan");   // 毒叟 白髯老者
