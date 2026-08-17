this.inherits(ROOM);
this.name = "大院";
this.desc = "一座宽阔的大院，青石铺地，四角种着几株老槐树。院中摆放着假山流水，颇有江南园林的韵味。但四下静得出奇，连鸟鸣声都没有，让人隐隐感到一丝不安。北面是温府大门，南面通向大厅。";
this.exits = { "north": "wf/damen", "south": "wf/dating" };
this.set_npc(["wf/wenjia", 1]);
