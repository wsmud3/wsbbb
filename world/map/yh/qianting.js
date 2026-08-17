this.inherits(ROOM);
this.name = "前厅";
this.desc = "移花宫的前厅，布置典雅，花香四溢。左右各通一位宫主的居所。";
this.exits = { "north": "yh/huajing5", "west": "yh/lianxinggong", "east": "yh/yaoyuegong", "south": "yh/woshi" };
this.set_npc(["yh/gongnv", 4]);
