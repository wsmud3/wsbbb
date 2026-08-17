this.inherits(ROOM);
this.name = "峨眉剑阵";
this.desc = "一片宽阔的练剑场，场上立着三十六柄石剑，排列成峨眉派独有的剑阵。剑阵之中剑气纵横——若不能以正确的步法通过，便会触发剑阵的自动攻击。";
this.exits = { "south": "jdfg/miejianfeng", "north": "jdfg/jingguangtai" };
this.on_create = function() { this.set_npc("jdfg/jianzhen_shouwei", 1); };
