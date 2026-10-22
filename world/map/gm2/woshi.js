this.inherits(ROOM);
this.name = "卧室";
this.desc = "这里是小龙女以前居住的卧室，房中空空洞洞，只放了一张寒玉模样的<cmd cmd='look chuang'>石床</cmd>。一幅白布当作薄被，此外除了一根人高的绳索横过室中，墙上挂着一副<span cmd='look hua'>画</span>，除此外别无他物。 ";
this.exits = {
    "south": "gm2/houtang",
};
this.set_npc([]);

// 原版机制（攻略第 30 节）：进卧室点「画」（没有高亮），看剑指哪个方向，记下来。
this.set_item("hua", "古画", "床头的墙上挂着一幅淡淡的水墨画，画中一柄长剑斜指一方。", [
    ["kan hua", "看画", function (me) {
        var dirs = ["北", "南", "东", "西"];
        var d = dirs[Math.floor(Math.random() * dirs.length)];
        var map = { "北": "north", "南": "south", "东": "east", "西": "west" };
        me.set_temp("gm2_sword_dir", map[d], 7200000);
        me.notify("<hiy>你细看古画：画中长剑斜指" + d + "方。</hiy>");
        return true;
    }]
]);
