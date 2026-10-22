this.inherits(ROOM);
this.name = "白河";
this.desc = "这里是长白山下的一个小村，只有四，五间粗陋的小木屋。这里并没有固定的居民，木屋都是进山采参的参客所盖，为的是在进山前能在这里好好的休息一下。东面就是巍峨耸立的长白大山。";
this.exits = {
    "west": "kw/caoguduo",
    "east": "kw/milin",
    "north": "kw/xiaowu",
};
this.set_npc(["kw/pingsi", 1]);
