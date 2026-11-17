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
    ["tanqin", "弹琴", function (me) {
        if (!me.is_player) return true;
        // 机关状态存副本存储：原先挂在玩家身上 2 小时，重刷时「机关已经开了」却没有出口
        if (this.query_temp(me, "gm2_qin_ok")) {
            me.notify("机关已经开了。");
            return true;
        }
        if (Math.random() < 0.5) {
            me.notify("<wht>你弹了半天，琴声仿若鸦鸣，你还是弹棉花去吧。</wht>");
            return true;
        }
        this.set_temp(me, "gm2_qin_ok", 1);
        me.send_room("$N挽起袖子，准备弹几下古琴，却不知道触动到什么机关，一阵声响后出现一个出口。");
        // add_exit 会刷新出口缓存；原先直接改 this.exits，客户端看不到 down 按钮
        this.add_exit("down", "gm2/anhe");
        NPC.CREATE("gm2/yangguo", this);
        NPC.CREATE("gm2/xiaolongnv", this);
        this.refresh(me);
        this.send_room("<hiy>小龙女和杨过闻声从内室走了出来。杨过对你说道：「阁下请离开古墓。」</hiy>");
        return true;
    }]
]);
