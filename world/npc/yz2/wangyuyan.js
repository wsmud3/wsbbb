this.inherits(NPC);
this.set({
    name: "王语嫣",
    desc: "一位貌若天仙的女子，精通天下武功，却不会一招半式。她正是王语嫣，武学理论的活百科全书。",
    gender: 0,
    age: 18,
    per: 28,
    hp: 715200,
    max_hp: 715200,
    mp: 149000,
    max_mp: 149000,
    score: 0,
    gj: 41520,
    fy: 25958,
    mz: 41520,
    ds: 25958,
    zj: 85
});
this.skill_map(
    ["literate", 2109]);

// 攻略：点击王语嫣有「询问还施水阁」，她会向你要秘籍（给不给随你，杀她不加进度）。
//   给她一本秘籍（背包里任意 book/ 物品，扣 1 本）：她指点水阁书架暗格，
//   之后在还施水阁搜索可多得一份残页（副本存储 yz2_wyy_gift）。
//   不给：她不再理你，无其他影响。
this.add_action("yz2_ask", "询问还施水阁", function (me) {
    if (!me || !me.is_player) return true;
    var room = this.environment;
    if (!room) return true;
    if (room.query_temp(me, "yz2_wyy_gift")) {
        me.notify("王语嫣微笑道：「还施水阁就在后厅灵位之后，对着灵位拜上三拜便是。书架最下层有个暗格，别忘了。」");
        return true;
    }
    if (room.query_temp(me, "yz2_wyy_refused")) {
        me.notify("王语嫣别过脸去：「你连一本书都舍不得，我还跟你说什么？」");
        return true;
    }
    me.notify("王语嫣眼睛一亮：「还施水阁？那是表哥家藏天下武学的地方……我也只进去过一回。」");
    me.notify("她咬了咬嘴唇，低声道：「你若肯把身上的武功秘籍借我看一本，我便把水阁里的秘密告诉你。」");
    var cmds = [];
    var seen = {};
    if (me.items) for (var i = 0; i < me.items.length && cmds.length < 16; i++) {
        var it = me.items[i];
        if (!it || !it.path || String(it.path).indexOf("book/") !== 0 || seen[it.id]) continue;
        seen[it.id] = 1;
        cmds.push("yz2_give " + it.id, "给她" + it.name);
    }
    if (!cmds.length) me.notify("<hiy>你翻遍行囊，也找不出一本武功秘籍。</hiy>");
    cmds.push("yz2_give none", "不给");
    me.send_commands.apply(me, cmds);
    return true;
});
