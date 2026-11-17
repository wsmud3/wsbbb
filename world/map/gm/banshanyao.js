this.inherits(ROOM);
this.name = "半山腰";
this.desc = "你爬上半山腰，望着对面的山。这边的山柔静阴郁，对面的山坡金色的阳光晒得一片亮晶。真象仙境一样，有什麽喜乐的事，如升平的音乐，在树梢与树梢间荡跌着，回乐着....";
// 按地图坐标与攻略路线补全/纠正出口（原缺回程或指错房间，锐金/巨木两旗进不去导致完成度卡 99%）
this.exits = {
    "east": "gm/shanpo1",
    "north": "gm/xiaolu1",
    "south": "gm/banshanting",
};
this.set_npc(["gm/zhangzhong", 1], ["gm/liumendizi", 1]);
