this.inherits(ROOM);
this.name = "真武剑台";
this.desc = "一座悬浮于太极真元之上的剑台。台上插着一柄古朴长剑——真武剑的幻影。此剑乃武当镇派之宝，传说张三丰以此剑斩妖除魔，创立武当一脉。剑台的守护灵在此等候——他手持太极剑，周身环绕阴阳二气。";
this.exits = { "south": "zw/liangyidian", "north": "zw/xuanwuchi" };
this.on_create = function () { this.set_npc("zw/zhenwujian_ling", 1); };
