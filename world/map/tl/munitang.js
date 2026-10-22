this.inherits(ROOM);
this.name = "牟尼堂";
this.desc = "这是高僧们的静修之处。整堂全以松木制成，板门木柱，木料均不去皮，天然质朴，和一路行来金碧辉煌的殿堂截然不同。室中五个和尚分坐五个蒲团。四僧朝外，东首一个和尚面朝里壁一动不动。　";
this.exits = {
    "north": "tl/banruo",
};
this.set_npc(["tl/kurongdashi", 1], ["tl/auto_2", 1]);

// 原版机制（攻略第 28 节，普通）：
//   牟尼堂里有枯荣大师和段誉。先比试枯荣、把他血量打低，再抓段誉（背负 debuff），
//   杀枯荣 → 三个和尚一轮六脉神剑昏迷攻击（1v3）→ 抗住并杀完 → 带着段誉回大门 = 100%。
this.add_action("zhua", "抓住段誉", function (me) {
    if (me.query_temp("tl_capture")) {
        me.notify("段誉已经被你抓着了。");
        return true;
    }
    me.set_temp("tl_capture", 1, 7200000);
    me.set_temp("tl_monks", 3, 7200000);
    me.send_room("$N一把扣住段誉的手腕，将他负在背上——身子顿时沉了几分。");
    me.notify("<hir>背负段誉：行动不便，三位本字辈高僧已经围了上来！</hir>");
    var monks = ["tl/bencan", "tl/benchen", "tl/benguan"];
    for (var i = 0; i < monks.length; i++) {
        var e = NPC.CREATE(monks[i], this);
        if (e) { e.do_kill(me); }
    }
    return true;
});
this.on_monk_die = function (me) {
    var n = (me.query_temp("tl_monks") || 0) - 1;
    me.set_temp("tl_monks", n, 7200000);
    if (n > 0) {
        me.notify("<hiy>还剩 " + n + " 位本字辈高僧。</hiy>");
        return;
    }
    me.remove_temp("tl_monks");
    me.remove_temp("tl_capture");
    me.add_fbscore(270);
    me.notify("<hig>三位高僧尽数退去。带着段誉回到大门，本关便算圆满。</hig>");
};
