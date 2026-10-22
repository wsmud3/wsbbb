this.inherits(NPC);
this.set({
    name: "周伯通",
    desc: "一个白发白须的老顽童，虽年过花甲却童心未泯，嬉皮笑脸，武功却是当世绝顶。",
    title: "<hiy>老顽童</hiy>",
    gender: 1,
    age: 65,
    per: 12,
    hp: 572000,
    max_hp: 572000,
    mp: 122000,
    max_mp: 122000,
    score: 0,
    gj: 41960,
    fy: 33592,
    mz: 45860,
    ds: 31960,
    zj: 1500
});
this.skill_map(
    ["dodge", 2220],
    ["parry", 2346],
    ["force", 2220],
    ["unarmed", 2164],
    ["kongmingquan", 2164, "unarmed"],
    ["jinyangong", 2220, "dodge"]);
this.set_drop({
    obj: "money/silver",
    min: 100,
    max: 200
}, {
    obj: ["book/bc#kongmingquan", "book/bc#jinyangong"],
    odds: 8500
});

// 原版机制：与周伯通切磋后拿到石匣（直接拿是行不通的，他会说没门儿）
this.add_action("qiecuo", "切磋", function (me) {
    if (me.query_temp("th_shixia") || me.query_temp("th_done")) {
        me.notify("周伯通摆手道：石匣已经给你啦，还打什么。");
        return true;
    }
    if (!me.query_temp("th_ask")) {
        me.notify("周伯通斜着眼道：你是谁？没门儿，我凭什么跟你打？");
        return true;
    }
    me.set_temp("th_shixia", 1, 7200000);
    me.add_obj("res/shixia", 1);
    me.send_room("$N与周伯通拆了几招，老顽童哈哈大笑。");
    me.notify("<hiy>周伯通笑道：好小子，有点意思！这石匣你拿去罢，反正我也打不开。</hiy>");
    return true;
});
