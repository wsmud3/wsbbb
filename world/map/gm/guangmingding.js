this.inherits(ROOM);
this.name = "光明顶";
this.desc = "这里就是明教光明顶。你走到这里，可看见三个黄金色大字。明教始终都以反元抗胡，行善去恶，除暴安良为自已的宗旨，但由于明教太大，门下教众难免莨莠不齐，至使被名门正派称为魔教。正中央坐一面红色火焰的大旗。";
this.exits = {
    "north": "gm/qi_houtu",
};
this.set_npc(["gm/auto_6", 1], ["gm/shuobude", 1], ["gm/pengyingyu", 1]);
