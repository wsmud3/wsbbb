this.inherits(NPC);
this.set({
    name: "黄蓉",
    desc: "一个娇美无匹的少女，一双漆黑大眼甚是灵动，嘴角带着狡黠的笑意。她正是桃花岛主黄药师的女儿。",
    gender: 2,
    age: 18,
    per: 30,
    hp: 560000,
    max_hp: 560000,
    mp: 176000,
    max_mp: 176000,
    score: 0,
    gj: 43260,
    fy: 30464,
    mz: 43260,
    ds: 31008,
    zj: 750
});
this.set_objects([
    "eq/lv0/cloth", 1, 1
]);
this.skill_map(
    ["dodge", 2052],
    ["parry", 2262],
    ["force", 2052],
    ["unarmed", 2052]);
this.set_drop({
    obj: "money/silver",
    min: 50,
    max: 100
}, {
    obj: ["book/bc#kongmingquan"],
    odds: 8500
});

// 原版机制（攻略第 19 节，普通）：
//   卧室碰到黄蓉，一定要与她对话（否则无法触发剧情），点询问石匣，
//   黄蓉叫你去找周伯通，和他切磋后拿到石匣，回来给她 → 再走迷阵 → 山洞 → 完成副本 100%。
this.add_action("xunwen", "询问石匣", function (me) {
    if (me.query_temp("th_done")) {
        me.notify("黄蓉笑道：石匣已经回来了，多谢你啦。");
        return true;
    }
    if (me.query_temp("th_shixia")) {
        me.notify("黄蓉伸手：石匣呢？快给我呀。");
        me.notify("<hiy>（点击「交石匣」把石匣给她）</hiy>");
        return true;
    }
    me.set_temp("th_ask", 1, 7200000);
    me.notify("黄蓉说道：我爹有个石匣，锁在洞里，钥匙在後山老顽童周伯通手里。");
    me.notify("黄蓉说道：你去后山山洞找他，跟他切磋切磋，他高兴了自然会把石匣给你。");
    return true;
});
this.add_action("gei", "交石匣", function (me) {
    if (me.query_temp("th_done")) {
        me.notify("黄蓉笑道：已经收下啦。");
        return true;
    }
    if (!me.query_temp("th_shixia")) {
        me.notify("黄蓉歪着头：你手上没有石匣呀。");
        return true;
    }
    var has = null;
    if (me.items) {
        for (var i = 0; i < me.items.length; i++) {
            if (me.items[i] && me.items[i].path === "res/shixia") { has = me.items[i]; break; }
        }
    }
    if (!has) {
        me.notify("黄蓉歪着头：石匣不在你身上。");
        return true;
    }
    me.remove_obj(has, 1);
    me.remove_temp("th_shixia");
    me.set_temp("th_done", 1, 7200000);
    me.add_fbscore(180);
    me.send_room("$N把石匣交给黄蓉，黄蓉眼睛一亮，欢天喜地地收下了。");
    me.notify("<hig>黄蓉笑道：多谢你啦！石匣回来了，这一趟就算你过关。</hig>");
    return true;
});
