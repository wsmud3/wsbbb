this.inherits(ROOM);
this.name = "忘忧谷";
this.desc = "这里是大轮寺外一处僻静所在，四下绝无人迹。前前後後，大大小小几百座佛塔，被白得耀眼的雪被披盖着。银白色的山野、雪地里闪耀着红色和蓝色的光带，五彩缤纷，迷宫样的琼楼仙阁在你眼前出现。南面一条小径不知通往何处。";
this.exits = {
    "north": "xd/shangu",
    "eastup": "xd/dongkou",
};
this.set_npc(["xd/xuedaolaozu", 1])
