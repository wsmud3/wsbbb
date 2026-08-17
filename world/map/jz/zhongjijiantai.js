this.inherits(ROOM);
this.name = "终极剑台";
this.desc = "虚空骤然炸裂。你发现自己站在一座悬浮于宇宙星河之间的剑台之上。脚下是无尽星空，头顶是万剑悬空。独孤剑意残影已不再是模糊的人形——他化作一道纯粹的光，不刺眼，但无处不在。「来。让我看看——这一千年来，人间又出了怎样的人物。」";
this.exits = { "south": "jz/wujianxukong", "north": "jz/chuanchengdian" };

this.on_create = function () {
    this.set_npc("jz/dugu_canying", 1);
};
