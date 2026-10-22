this.inherits(ROOM);
this.name = "无我阁";
this.desc = "这是历代大理王侯前来进香还愿时休息的地方。阁内檀象宝炉，软榻矮几，一应俱全，清静之中隐然透出一丝富贵之象。";
this.exits = {
    "south": "tl/wuchang",
    "northeast": "tl/ta",
};
this.set_npc(["tl/benguan", 1]);
