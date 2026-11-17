this.inherits(ROOM);
this.name = "练武场";
this.desc = "这是明教的练武场。由数块巨大的花岗岩铺垫而成。地面坑坑洼洼留下无数脚印，可见教中弟子用功之甚。当中摆放着许多由锐金旗的能工巧匠们精心制作的练功铜人。";
// 按地图坐标与攻略路线补全/纠正出口（原缺回程或指错房间，锐金/巨木两旗进不去导致完成度卡 99%）
this.exits = {
    "south": "gm/qi_houtu",
    "east": "gm/qi_liehuo",
    "north": "gm/juyiting",
    "west": "gm/qi_ruijin",
};
this.set_npc(["gm/weiyixiao", 1], ["gm/yintianzheng", 1]);
