this.inherits(ROOM);
this.name = "山道";
this.desc = "这是一条狭窄的山道，向着北方一座山峰行去。转过了几个山坡，抬头遥见峰顶建着几座大竹屋。";
this.exits = { "north": "bj/slj/wuchang", "south": "bj/slj/damen" };
this.set_npc(["bj/slj/dizi", 2]);
