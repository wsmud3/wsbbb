this.inherits(ROOM);
this.name = "锐金旗";
this.desc = "你进到这里就感到一股热浪扑面而来，只见正中的巨大火炉正喷出炙热火焰，四周几个大汉正用力打造手里的兵器，汗水滴在炉台上冒出阵阵白雾。这里就是教中的锐金旗，教中厉害无比的机关、暗器和铜人都出自这里的能工巧匠之手。";
// 按地图坐标与攻略路线补全/纠正出口（原缺回程或指错房间，锐金/巨木两旗进不去导致完成度卡 99%）
this.exits = {
    "south": "gm/qi_jumu",
    "east": "gm/lianwu",
};
this.set_npc(["gm/zhuangzheng", 1], ["gm/liumendizi", 3]);
