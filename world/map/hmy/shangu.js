this.inherits(ROOM);
this.name = "山谷";
this.desc = "这里是一处山谷，上面种植着草坪。南下是『日月神教』的青龙堂。北面是白虎堂，东面是个树林，据说『日月神教』总部就在那里面。";
this.exits = {
    "east": "hmy/shulin",
};
this.set_npc(["hmy/auto_3", 1]);
