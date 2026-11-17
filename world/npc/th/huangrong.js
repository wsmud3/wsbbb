this.inherits(NPC);
this.set({
    name: "黄蓉",
    desc: "一个娇美无匹的少女，一双漆黑大眼甚是灵动，嘴角带着狡黠的笑意。她正是桃花岛主黄药师的女儿。",
    gender: 2,
    age: 18,
    per: 30,
    hp: 314947,
    max_hp: 314947,
    mp: 176000,
    max_mp: 176000,
    score: 0,
    gj: 22106,
    fy: 13599,
    mz: 22106,
    ds: 16014,
    zj: 335
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

// 原版机制（攻略第 19 节，普通模式；困难模式卧室没有黄蓉，见 th/woshi）：
//   卧室碰到黄蓉，一定要与她对话（点「询问石匣」，否则无法触发剧情），黄蓉叫你去找周伯通；
//   自行返回渔夫处再走一遍迷阵，迷阵里会多出一条路通往山洞（th/tao0），
//   在山洞比试或者杀掉周伯通拿到石匣（th/zhoubotong），回来交给黄蓉 → 完成副本 100%。
// 进度存副本存储（room.set_temp(me, …)），随副本销毁：
//   th_ask 已询问石匣；th_done 已交回石匣。
var HR_SHIXIA = "res/shixia";
function hr_room(npc) { return npc.environment; }
function hr_get(npc, me, k) { var r = hr_room(npc); return r ? r.query_temp(me, k, 0) : 0; }
function hr_set(npc, me, k, v) { var r = hr_room(npc); if (r) r.set_temp(me, k, v); }

this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    if (hr_get(this, me, "th_done")) return;
    me.notify("黄蓉托着腮坐在窗前，见你进来，眼珠一转，笑道：「你来得正好，我正有件事要找人帮忙呢。」");
};

this.add_action("xunwen", "询问石匣", function (me) {
    if (!me.is_player) return true;
    if (hr_get(this, me, "th_done")) {
        me.notify("黄蓉笑道：石匣已经回来了，多谢你啦。");
        return true;
    }
    if (me.find_obj_bypath(HR_SHIXIA)) {
        me.notify("黄蓉眼睛一亮：石匣拿到啦？快给我呀。");
        me.send_commands("gei " + this.id, "交石匣");
        return true;
    }
    var first = !hr_get(this, me, "th_ask");
    hr_set(this, me, "th_ask", 1);
    me.notify("黄蓉说道：我爹有只石匣，被老顽童周伯通拿去玩了，他就躲在桃林里的一个山洞里。");
    me.notify("黄蓉说道：那山洞藏在桃花阵里，你回到海边渔夫那儿，再走一遍桃林，留心路上的变化，自然看得见。");
    me.notify("黄蓉说道：老顽童最爱跟人打架，你跟他比试比试，赢了他自然会把石匣给你。");
    return true;
});
this.add_action("gei", "交石匣", function (me) {
    if (!me.is_player) return true;
    if (hr_get(this, me, "th_done")) {
        me.notify("黄蓉笑道：已经收下啦。");
        return true;
    }
    var has = me.find_obj_bypath(HR_SHIXIA);
    if (!has) {
        me.notify("黄蓉歪着头：你手上没有石匣呀。");
        return true;
    }
    me.remove_obj(has, 1);
    hr_set(this, me, "th_done", 1);
    var area = this.environment && this.environment.parent;
    me.add_fbscore((area && area.score) || 180);
    me.send_room("$N把石匣交给黄蓉，黄蓉眼睛一亮，欢天喜地地收下了。");
    me.notify("<hig>黄蓉笑道：多谢你啦！石匣回来了，这一趟就算你过关。</hig>");
    return true;
});
// 石匣交回之前不许杀黄蓉（否则剧情断掉、本轮永远到不了 100%）
this.on_kill = function (me) {
    if (me && me.is_player && !hr_get(this, me, "th_done")) {
        me.notify("黄蓉身形一晃躲到屏风后，嘻嘻笑道：「石匣还没拿回来呢，你打我做什么？」");
        return false;
    }
    return true;
};
