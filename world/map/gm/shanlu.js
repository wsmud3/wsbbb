this.inherits(ROOM);
this.name = "山路";
this.desc = "上得峰来，但见山势险峻，树木清幽，鸟鸣嘤嘤，流水淙淙。你越山脊而上，两崖深不见底，凡险峻处，如身置太空，肝摇胆撼。";
// 按地图坐标与攻略路线补全/纠正出口（原缺回程或指错房间，锐金/巨木两旗进不去导致完成度卡 99%）
this.exits = {
    "northwest": "gm/banshanting",
    "east": "gm/zhandao",
};
this.set_npc([]);
