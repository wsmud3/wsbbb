this.inherits(ROOM);
this.name = "卧室";
this.desc = "古墓内的卧室，一张寒玉石床散发着冰冷的灵气，墙上挂着一幅古画。画上一位白衣女子手持长剑，剑尖指向某处。";
this.exits = { "south": "gm2/houtang" };
this.set_npc([]);

// 原版机制：点「画」（没有高亮）看剑指哪个方向，记下来，后面暗河要靠它。
this.add_action("look_hua", "查看古画", function (me) {
    var dirs = ["north", "south", "east", "west"];
    var dir = me.query_temp("gm2_sword_dir");
    if (!dir) {
        dir = dirs[Math.floor(Math.random() * dirs.length)];
        me.set_temp("gm2_sword_dir", dir, 7200000);
    }
    var cn = { north: "北", south: "南", east: "东", west: "西" }[dir];
    me.notify("<hiy>你细看那幅画：白衣女子手中长剑的剑尖，正指向【" + cn + "】面。</hiy>");
    me.notify("（记下这个方向，暗河里要往这边游。）");
    return true;
});
