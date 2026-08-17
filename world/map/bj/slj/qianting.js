this.inherits(ROOM);
this.name = "前厅";
this.desc = "这里是神龙教的前厅，厅中陈设华丽，四壁挂满了各种奇珍异宝。左右站着两排神龙教弟子，神情肃穆。北面便是神龙教大厅，依稀可听见众人念颂之声。";
this.exits = { "north": "bj/slj/damen", "south": "bj/slj/dating" };
this.set_npc("bj/slj/erdangjia", "bj/slj/sandangjia");
