this.inherits(ROOM);
this.name = "空地";
this.desc = "这是一片空地，四周都是乱石，杂草丛生。北面是深深的灌木林，南面是一个宽阔的练武场，西面隐约可见一个蛇窟入口。";
this.exits = { "north": "bj/slj/lin2", "south": "bj/slj/wuchang" };
this.set_npc(["bj/slj/dizi", 2]);
