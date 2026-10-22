this.inherits(ROOM);
this.name = "练武场";
this.desc = "这里是院内的练武场，黄土场地上摆放着一些练功的石锁，沙袋。一个小头目正在指导弟子练武。  ";
this.exits = {
    "east": "wudu/dating",
    "south": "wudu/nanyuan",
    "west": "wudu/damen",
};
this.set_npc(["wudu/shaqianli", 1]);
