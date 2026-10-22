this.inherits(ROOM);
this.name = "山庄前院";
this.desc = "你现在正站在一个宽敞的院子中。院子原来是作为练武场用的。但自从桃花岛弟子被黄药师逐出岛外，就已经没人在此练武。东面是兵器室，西面是厨房，往南就是桃花山庄正厅了。";
this.exits = {
    "east": "th/dating",
    "west": "th/damen",
};
this.set_npc(["th/qulingfeng", 1]);
