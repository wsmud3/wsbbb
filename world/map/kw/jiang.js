this.inherits(ROOM);
this.name = "松花江面";
this.desc = "西面就是宽阔的松花江。江水浑浊，一眼望不到对岸。江边系着一条渡船。";
this.exits = {
    "east": "kw/damen",
};
this.set_npc([]);

// 原版（实测）：在大门往西会遇船夫，收 1 两黄金（10000 文）渡到对岸雪地。
// 这里把船夫与交钱按钮放在江面。
this.set_item("chuan", "渡船", "一条不大的渡船系在岸边。", [
    ["zuo chuan", "坐船过江", function (me) {
        if (!me.is_player) return true;
        var money = me.query_prop ? (me.query_prop("money") || 0) : 0;
        if (money < 10000) {
            me.notify("<red>船夫摇头：坐船到江对面要 1 两黄金（10000 文），你钱不够。</red>");
            return true;
        }
        me.add_money(-10000);
        me.notify("<hiy>船夫接过船资，撑起竹篙。</hiy>");
        me.moveto("kw/xuedi1");
        return true;
    }]
]);
