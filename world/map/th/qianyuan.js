this.inherits(ROOM);
this.name = "前院";
this.desc = "桃花岛的前院，青石铺地，整洁雅致。院中种着几株桃花，花瓣飘落一地。北面是岛主的居所，南面通向试剑亭。";
this.exits = { "north": "th/woshi", "south": "th/shijianting" };
this.set_npc(["th/qulingfeng", 1]);
