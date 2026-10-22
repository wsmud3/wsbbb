this.inherits(ROOM);
this.name = "中门";
this.desc = "这里是峻极禅院通往后庭的中门，门厚三寸，红松铜箍，门上两幅门神经多年风雨，多有剥落，现下颜色尚新，想来是嵩山派新近油漆了的。外派人士到此就该回头了。";
this.exits = {
    "north": "ss/huimengtang",
    "south": "ss/junjichanyuan",
};
this.set_npc("ss/dengbagong");   // 邓八公 score55（中门）
