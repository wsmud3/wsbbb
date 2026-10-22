this.inherits(ROOM);
this.name = "大厅";
this.desc = "你来到温家大宅会客的大厅里，这里灯火通明，屋内陈设很是精巧，两个制作精美的有一人般高的大瓷瓶放在厅的两侧，四周的墙上挂着许多文人墨客的字画，大厅上面有块匾，上书“正义堂”三个大字。有个中年人正坐在八仙桌旁悠闲地喝着茶，好象在沉思着什么。";
this.exits = {
    "northwest": "wf/zoulang1",
    "northeast": "wf/zoulang1",
    "south": "wf/dayuan",
};
this.set_npc(["wf/wenfangda", 1]);
