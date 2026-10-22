this.inherits(ROOM);
this.name = "琴室";
this.desc = "琴室之中摆着一张古琴，案上尘封已久。抚琴可开地下暗河。";
this.exits = { "north": "gm2/houtang", "south": "gm2/anhe" };
this.set_npc([]);

// 原版机制：点「古琴」（没有高亮）弹几下，小龙女和杨过会出来。
this.add_action("play_qin", "抚琴", function (me) {
    var n = (me.query_temp("gm2_qin") || 0) + 1;
    me.set_temp("gm2_qin", n, 7200000);
    me.notify("<hiw>你轻拢慢捻，琴声在古墓中回荡……（第 " + n + " 声）</hiw>");
    if (n < 3) return true;

    // 弹满三下：小龙女、杨过现身
    if (!this.find_obj_bypath || !this.find_obj_bypath("gm2/xiaolongnv")) {
        NPC.CREATE("gm2/xiaolongnv", this);
        NPC.CREATE("gm2/yangguo", this);
    }
    me.notify("<hiy>琴声未落，小龙女与杨过已从暗门后走了出来。</hiy>");
    me.notify("<hiy>小龙女冷冷道：「既然来了，便比试一场罢。」</hiy>");
    return true;
});
