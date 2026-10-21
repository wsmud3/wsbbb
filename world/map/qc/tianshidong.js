this.inherits(ROOM);
this.name = "天师洞";
this.desc = "天师洞以东汉张陵在此讲道修炼而得名，又名古常道观。洞在山腰混元顶下峭壁间。中塑天师像，沿岩壁有廊可通。正殿名三皇殿，重檐回廊，雄踞高台，气势宏伟。内供伏羲、神农、轩辕三皇石刻造像。";
this.exits = {
    "eastdown": "qc/shanlu",
    "north": "qc/gulongqiao",
};
this.set_npc("qc/npc02");   // 青城派外门弟子 青城派弟子
