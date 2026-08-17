this.inherits(ROOM);
this.name = "凌波微步廊";
this.desc = "一条铺着八卦图案的长廊——每块地砖上都刻着一个八卦方位。这是凌波微步的修炼之地——踩着正确的方位才能通过，否则会触发机关。长廊两侧悬挂着风铃，风吹铃响，如仙乐飘飘。";
this.exits = { "south": "lhfd/beimingzhuke", "north": "lhfd/baihongdian" };
this.on_create = function() { this.set_npc("lhfd/lingbo_shouwei", 1); };
