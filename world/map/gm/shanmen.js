this.inherits(ROOM);
this.name = "山门";
this.desc = "这就是明教的山门，朱红色的两根大柱子矗立在你的面前，上面悬挂着一块黑色大匾，上书着“名扬五湖，威镇四海”几个金色大字，甚是威严。";
// 按地图坐标与攻略路线补全/纠正出口（原缺回程或指错房间，锐金/巨木两旗进不去导致完成度卡 99%）
this.exits = {
    "north": "gm/zhandao",
};
this.set_npc(["gm/auto_11", 1], ["pub/dongfeng", 1]);
