this.inherits(ROOM);
this.name = "练武场";
this.desc = "这里是青城弟子练功习武之所，“冬练三九、夏练三伏”，出家人往往勤快一些，往往天光才有鱼肚白，这里就有练功的影子。到得日出山坳，便是满场的人声了。";
this.exits = {
    "south": "qc/zoulang",
    "north": "qc/zhudian",
    "east": "qc/huayuan",
};
this.set_npc(["qc/auto_1", 1]);
