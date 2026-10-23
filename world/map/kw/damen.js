this.inherits(ROOM);
this.name = "大门坎子";
this.desc = "这里是沿江向东的古道，多为进山采参的参客所走，因此也称“参路”。前面一座小山截断去路，因其行似门坎，且为东去采参的第一道屏障，故被称为大门坎子。西面是宽阔的松花江。松花江在冬春时结冰可通行，夏秋化冻你只好找船家帮忙了。";
this.exits = {
    "northeast": "kw/chuanchang",
};
this.set_npc(["kw/chuanfu", 1]);

// 原版：往西过江要付船夫 1 两黄金（10000 文），不交钱过不去。
this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (dir === "west") {
        me.notify("船夫对你说道：坐船到江对面1两黄金。");
        return false;
    }
    return true;
};

this.set_item("duchuan", "渡船", "一条不大的渡船系在岸边，船夫在船尾把着舵。", [
    ["zuo", "坐船过江", function (me) {
        if (!me.is_player) return true;
        var money = me.money || 0;
        if (money < 10000) {
            me.notify("<red>船夫摇头：到江对面要 1 两黄金（10000 文），你钱不够。</red>");
            return true;
        }
        me.money -= 10000;
        me.notify("<hiy>船夫接过船资，撑起竹篙，渡船缓缓向对岸驶去。</hiy>");
        me.moveto("kw/jiang");
        return true;
    }]
]);
