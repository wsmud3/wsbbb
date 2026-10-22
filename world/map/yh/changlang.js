this.inherits(ROOM);
this.name = "桂花廊";
this.desc = "这是通往宫主寝宫的长廊，柱子和栏杆上都缠满了美丽的桂花，左边有一间房间，从里面传来很嘈杂的声音，似乎有很多人。";
this.exits = {
    "south": "yh/changlang1",
    "north": "yh/damen",
};
this.set_npc(["yh/auto_2", 1]);
