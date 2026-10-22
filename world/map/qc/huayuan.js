this.inherits(ROOM);
this.name = "花园";
this.desc = "这是松风观后的一个园子，庭院清幽，异种花卉甚是不少。此处高寒花卉也异平常，风姿倬约，煞是惹人怜爱。东面通往掌门人卧室，南面是三清殿。";
this.exits = {
    "west": "qc/caochang",
    "north": "qc/woshi",
};
this.set_npc(["qc/yurenyan", 1]);
