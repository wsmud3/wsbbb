this.inherits(ROOM);
this.name = "大门";
this.desc = "这里是一座隐没于山林中的大宅院，高高的围墙，朱红的大门，好象是一座有钱人家的避暑别院。 ";
this.exits = {
    "east": "wudu/lianwu",
};
this.set_npc(["wudu/wududizi", 1]);
