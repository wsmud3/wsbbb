this.inherits(ROOM);
this.name = "栈道";
this.desc = "这一条长长的栈道，通往明教总坛光明顶，栈道两边地势险要，易守难攻，南面就是明教的山门。";
// 按地图坐标与攻略路线补全/纠正出口（原缺回程或指错房间，锐金/巨木两旗进不去导致完成度卡 99%）
this.exits = {
    "west": "gm/shanlu",
    "south": "gm/shanmen",
};
this.set_npc([]);
