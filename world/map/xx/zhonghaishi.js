this.inherits(ROOM);
this.name = "星宿海";
this.desc = "这里是星宿海边。说是海，其实是片湖泊和沼泽，地形十分险恶。东面石壁上一道裂缝通到一个山洞，这里左右两厢通向星宿海的深处，北边是星宿派总舵——日月洞。";
this.exits = {
    "north": "xx/riyuedong",
    "southwest": "xx/xxh2",
    "southeast": "xx/xxh3",
};
this.set_npc(["xx/shihouzi", 1]);
