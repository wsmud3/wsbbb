this.inherits(ROOM);
this.name = "铜人巷";
this.desc = "一条狭长的通道，两侧排列着十八尊铜人。每尊铜人都摆出不同的少林武功架势——龙爪手、般若掌、拈花指……铜人眼中闪烁着机关的光芒。击败铜人阵，方可通行。";
this.exits = { "south": "dmd/xinmo_chi", "north": "dmd/murenxiang" };
this.on_create = function() { this.set_npc("dmd/tongren_zhen", 1); };
