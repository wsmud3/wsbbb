this.inherits(ROOM);
this.name = "琴室";
this.desc = "一张石桌，一条石凳，桌上放着一把<span cmd='look qin'>古琴</span>，是小龙女休憩时刻抚琴抒怀的地方。每每琴音袅袅，平淡清和，直引人心弛神往，与世无争。 ";
this.exits = {
    "west": "gm2/houtang",
};
this.set_npc([]);

// 原版机制：琴室点「古琴」弹几下，触动机关后出现通往地下暗河的出口，
// 同时小龙女和杨过出现（攻略：弹几下，小龙女和杨过会出来）。
this.set_item("qin", "古琴", "石桌上放着一把古琴，琴身温润。", [
    ["tan qin", "弹琴", function (me) {
        if (me.query_temp("gm2_qin_ok")) {
            me.notify("机关已经开了。");
            return true;
        }
        if (Math.random() < 0.5) {
            me.notify("<wht>你弹了半天，琴声仿若鸦鸣，你还是弹棉花去吧。</wht>");
            return true;
        }
        me.set_temp("gm2_qin_ok", 1, 7200000);
        me.send_room("$N挽起袖子，准备弹几下古琴，却不知道触动到什么机关，一阵声响后出现一个出口。");
        this.exits = { "west": "gm2/houtang", "down": "gm2/anhe" };
        this.item_changed(null, true);
        var a = NPC.CREATE("gm2/yangguo", this);
        var b = NPC.CREATE("gm2/xiaolongnv", this);
        if (a) a.notify && 0;
        if (b) b.notify && 0;
        this.send_room("杨过对你说到：道长，请你离开古墓。");
        return true;
    }]
]);
