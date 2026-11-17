this.inherits(ROOM);
this.name = "光明顶";
this.desc = "这里就是明教光明顶。你走到这里，可看见三个黄金色大字。明教始终都以反元抗胡，行善去恶，除暴安良为自已的宗旨，但由于明教太大，门下教众难免莨莠不齐，至使被名门正派称为魔教。正中央坐一面红色火焰的大旗。";
// 按地图坐标与攻略路线补全/纠正出口（原缺回程或指错房间，锐金/巨木两旗进不去导致完成度卡 99%）
this.exits = {
    "north": "gm/qi_houtu",
    "south": "gm/xiaolu1",
};
this.set_npc(["gm/miejueshitai", 1], ["gm/shuobude", 1], ["gm/pengyingyu", 1]);
