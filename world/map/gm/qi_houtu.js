this.inherits(ROOM);
this.name = "厚土旗";
this.desc = "这里是明教厚土旗。旗中教众个个膀粗腰圆，力大无穷的样子。数十年来的辛苦劳作, 把光明顶建设得坚固无比。与分列四角的锐金、巨木、洪水、烈火四旗互相呼应，共担防守重任。";
this.exits = {
    "north": "gm/lianwu",
};
this.set_npc(["gm/auto_5", 1], ["gm/auto_4", 1]);
