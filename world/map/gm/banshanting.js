this.inherits(ROOM);
this.name = "半山亭";
this.desc = "上到岭上，岭上有个小厅，建筑清丽，真令人感叹其建筑材料是怎麽运上山来的。放眼望去，只见迎面飞来一道白链，如万丈银河，泻入深谷，若似静止一般，不闻其声。此刻情景如图画里万壑千谷，壁上一道飞瀑，云烟处茅舍几间，小桥一抹，诗情画意。";
// 按地图坐标与攻略路线补全/纠正出口（原缺回程或指错房间，锐金/巨木两旗进不去导致完成度卡 99%）
this.exits = {
    "southeast": "gm/shanlu",
    "north": "gm/banshanyao",
};
this.set_npc(["gm/lengqian", 1], ["gm/liumendizi", 1]);
