this.inherits(ROOM);
this.name = "山道";
this.desc = "这是一条好似水晶铺成的宽敞大道,每块都是长约八尺，宽约三尺，甚是整齐，堪称巧夺天工。道旁是郁郁葱葱的玫瑰丛，不时可以看到一两只野兔蹦蹦跳跳地跃向丛中深处。往南望去，一座巨大的宫殿巍然耸立。旁边有一块石碑(bei)。";
this.exits = {
    "south": "yh/yihua0",
};
this.set_npc(["yh/auto_1", 1]);
