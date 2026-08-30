// 山外山·山门：进入秘境的初始地图。此处不战斗，也不布置守护者；
// 山门中立着守山人（sws/shou_shan_ren），可查询本人最高层与全服最高层纪录。
// 沿「登山」进入 sws/ceng 才真正开始攀登（每层击败守护者后择「山外之意」）。
this.inherits(ROOM);
this.name = "山门";
this.desc = "山外青山楼外楼。这里是山外山的山门，一座石牌坊立于云海之畔，匾额上刻着「山外山」三个大字，笔力苍劲，直欲破石而出。\n" +
    "门前站着一位白发苍苍的守山人，身后一道白玉石阶没入云雾深处，那便是登山之路。传闻山外山层数无尽，登临越高，名传越远；元晶、武道残页、神器碎片、神魂碎片等重宝，每层只有首次登临者方能领取。";
this.exits = { "up": "sws/ceng", "out": "yz/guangchang" };
this.max_item_count = 5;
this.set_npc("sws/shou_shan_ren");

this.on_before_enter = function (me) {
    if (!me.is_player) return;
    var area = this.parent;
    if (area && area.sws_setup_start) area.sws_setup_start(this, me);
};

// 出口按钮用固定文案，避免层数/房间名串显
this.exitsto_roomjson = function () {
    return JSON.stringify({ type: "exits", items: { "up": "登山", "out": "离开秘境" } });
};
