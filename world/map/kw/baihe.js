this.inherits(ROOM);
this.name = "白河";
this.desc = "一条冰冻的白河横在面前，河面结着厚厚的冰层。北边有一间简陋的小屋，东边通往密林方向。";
this.exits = { "east": "kw/milin1", "west": "kw/gucaoduo", "north": "kw/xiaowu" };
this.set_npc(["kw/pingsi", 1]);
