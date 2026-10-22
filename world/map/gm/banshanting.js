this.inherits(ROOM);
this.name = "半山厅";
this.desc = "上到岭上，岭上有个小厅，建筑清丽，真令人感叹其建筑材料是怎麽运上山来的。放眼望去，只见迎面飞来一道白链，如万丈银河，泻入深谷，若似静止一般，不闻其声。此刻情景如图画里万壑千谷，壁上一道飞瀑，云烟处茅舍几间，小桥一抹，诗情画意。";
this.exits = {
    "southeast": "gm/shanlu",
    "north": "gm/banshanyao",
};
this.set_npc(["gm/auto_1", 1], ["gm/auto_4", 1]);
