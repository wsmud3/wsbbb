this.inherits(ROOM);
this.name = "桂花廊";
this.desc = "这是通往宫主寝宫的长廊，柱子和栏杆上都缠满了美丽的鲜花，香气扑鼻。";
this.exits = {
    "north": "yh/yihuage",
    "south": "yh/changlang1",
};
this.set_npc(["yh/gongnv", 2]);

// 困难掉落约为普通两倍（攻略）
this.on_set_difficulty = function (type) {
    if (type !== 1 || !this.parent || !this.parent.yh_hard_drops) return;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i] && !this.items[i].is_player) this.parent.yh_hard_drops(this.items[i]);
    }
};
