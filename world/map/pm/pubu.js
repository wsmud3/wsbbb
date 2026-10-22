this.inherits(ROOM);
this.name = "瀑布";
this.desc = "一道银练般的瀑布从悬崖上飞泻而下，水雾弥漫，阳光下现出七彩虹霓。瀑布后隐约可见一个山洞。";
// south 原本指向 pm/shandao3（房间文件不存在）——服务端 exitsto_roomjson 会
// 因为 ROOM.Get 取不到而直接吞掉这个出口，玩家看到的就是「这个方向没有按钮」。
// 瀑布本身只有西面一条真实通路（山涧），去掉这个悬空出口。
this.exits = {"west":"pm/shanjian"};
this.set_npc([]);
