this.inherits(ROOM);
this.name = "一天门";
this.desc = "北面有一座天阶坊，过了此坊便进入了登泰山的盘道。南面有一座更衣亭，士大夫们及其随从，都会在这里换上轻便的服装，才继续登山。从一天门向北眺望，南天门与十八盘在云雾明灭间或隐或现，登泰山的人到此已有观止之叹。附近有一牌坊，上写「孔子登临处」，相传为「孔子过泰山侧」的故事发生的地方。";
this.exits = {
    "southdown": "ts/daizong",
    "northup": "ts/ertian",
};
this.set_npc([]);
