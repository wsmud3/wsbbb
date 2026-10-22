this.inherits(ROOM);
this.name = "独尊厅大门";
this.desc = "这就是通向『灵鹫宫』独尊厅的大门。大门左右各有一头石雕的猛鹫，高达三丈有余，尖喙巨爪，神骏非凡，栩栩如生，似乎随时要腾空而去。";
this.exits = {
    "north": "pm/dating",
    "south": "pm/dadao"
};
this.set_npc(["pm/auto_2", 1]);
