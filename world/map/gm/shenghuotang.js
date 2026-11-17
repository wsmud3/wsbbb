this.inherits(ROOM);
this.name = "圣火堂";
this.desc = "这里是明教最深处——圣火堂。堂中燃着一炉不灭的圣火，火光映着满壁的火焰纹。张无忌立在圣火之前，左右两侧站着两位光明使者：杨逍与范遥。";
// 按地图坐标与攻略路线补全/纠正出口（原缺回程或指错房间，锐金/巨木两旗进不去导致完成度卡 99%）
this.exits = {
    "south": "gm/juyiting",
    "west": "gm/xiaoting",
};
this.set_npc(["gm/yangxiao", 1], ["gm/fanyao", 1], ["gm/zhangwuji", 1]);
