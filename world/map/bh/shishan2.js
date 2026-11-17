this.inherits(ROOM);
this.name = "石山";
this.desc = "这是一座小山石，比之西面的石山要小多了。山石周围到处都是奇花异树，异树丛中传来阵阵的奇香，皆由不知名之花朵传出。山脚下露出一个小小的<cmd cmd='look dong'>石洞</cmd>，西边有一座石山。";
this.exits = {
    "east": "bh/shishan",
};
this.set_npc([]);

// 攻略：走到里边的石山，房间描述出现「石洞」，钻进去，遇见谢逊。
this.set_item("dong", "石洞", "山脚下一个小小的石洞，仅容一人弯腰钻入，洞里隐约透出火光。", [
    ["zuan", "钻进去", function (me) {
        if (!me.is_player) return true;
        if (me.is_fighting && me.is_fighting()) { me.notify("你正在战斗，钻不进去。"); return true; }
        me.moveto("bh/xiaodong", me.name + "弯腰钻进了石洞。", me.name + "从石洞外钻了进来。");
        return true;
    }]
]);
