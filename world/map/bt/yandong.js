this.inherits(ROOM);
this.name = "岩洞";
this.desc = "一个幽深的岩洞，洞壁湿滑，腥风阵阵。洞内温度比外面高出许多，洞深处盘踞着一条巨蟒，蛇信吞吐之间散发出令人作呕的腥臭。";
this.exits = { "south": "bt/caocong" };
this.set_npc(["bt/mangshe", 1]);
