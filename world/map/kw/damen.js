this.inherits(ROOM);
this.name = "大门坎子";
this.desc = "这里是沿江向东的古道，多为进山采参的参客所走，因此也称“参路”。前面一座小山截断去路，因其行似门坎，且为东去采参的第一道屏障，故被称为大门坎子。西面是宽阔的松花江。松花江在冬春时结冰可通行，夏秋化冻你只好找船家帮忙了。";
this.exits = {
    "north": "kw/jiang",
    "northeast": "kw/ermenkan",
};
this.set_npc(["kw/chuanfu", 1]);

// ────────────────────────────────────────────────────────────
// 渡船（原版：松花江夏秋化冻，只能找船夫摆渡，船资 1 两黄金＝10000 文）
//
//   大门坎子 --找船夫--> 付 1 两黄金 --> 位置改到 松花江上
//        --> 渡船前进 10 秒（途中每 3 秒一句航行提示）--> 靠岸 船厂
//
// 走进 north（也就是地图上点「松花江上」）一律被船夫拦下先问船资，
// 所以渡江只有「付钱坐船」这一条路，不存在走着过江。
// ────────────────────────────────────────────────────────────
var KW_FERRY_FEE = 10000;

function kw_ferry_ask(me) {
    me.notify("<hiy>船夫一把拦住你：江面水急，硬蹚是过不去的，还是坐我的船稳当——到对岸船资 1 两黄金（" + KW_FERRY_FEE + " 文）。</hiy>");
    me.send_commands("kw_ferry_pay", "付 1 两黄金过江", "kw_ferry_deny", "先不去了");
}

this.on_leave = function (me, dir) {
    if (!me.is_player) return true;
    if (dir === "north") {
        kw_ferry_ask(me);
        return false;
    }
    return true;
};

this.add_action("kw_ferry_pay", null, function (me) {
    if (!me.is_player) return true;
    if (!me.environment || me.environment.path !== "kw/damen") {
        me.notify("船夫不在这一岸。");
        return true;
    }
    if ((me.money || 0) < KW_FERRY_FEE) {
        me.notify("<red>船夫摇了摇头：船资 1 两黄金（" + KW_FERRY_FEE + " 文），你带的钱不够。</red>");
        return true;
    }
    if (!me.add_money(-KW_FERRY_FEE)) {
        me.notify("<red>你身上的钱不够付船资。</red>");
        return true;
    }
    me.notify("<hiy>你数出 1 两黄金递给船夫。</hiy>");
    // 先挂上船标记再上船：松花江上的 on_enter 靠它认「是坐船来的」
    me.set_temp("kw_on_boat", 1, 60000);
    if (me.moveto("kw/jiang", me.name + "登上了渡船。", me.name + "被人扶上了渡船。") === false) {
        me.remove_temp("kw_on_boat");
        return true;
    }
    // 航程本体在松花江上（kw/jiang）里，两岸共用
    if (me.environment && me.environment.start_ride)
        me.environment.start_ride(me, "kw/chuanchang");
    return true;
});

this.add_action("kw_ferry_deny", null, function (me) {
    if (!me.is_player) return true;
    me.notify("船夫点点头：客官要过江，随时招呼我。");
    return true;
});
