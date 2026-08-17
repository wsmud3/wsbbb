this.inherits(ROOM);
this.name = "六阳掌碑";
this.desc = "一块高大的石碑，碑上刻着「天山六阳掌」的掌法口诀。六阳掌以至阳至刚为特点——「六阳汇聚，一掌开天。」但碑底有一行小字：「刚则易折，柔能克刚。无崖子补注。」";
this.exits = { "south": "lhfd/tianshanzhemeitai", "north": "lhfd/piaomiaolang" };
this.on_create = function() { this.set_npc("lhfd/liuyang_shouwei", 1); };
