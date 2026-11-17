this.inherits(NPC);
this.set({
    name: "阿朱",
    desc: "一位明眸善睐的少女，笑靥如花。她是姑苏慕容家的婢女，却是易容术的绝世高手。她眨眨眼，低声道：『只要十两黄金，我便为你做一张面具，戴上它，你就是另一个人。』",
    gender: 0,
    age: 18,
    per: 26,
    hp: 760000,
    max_hp: 760000,
    mp: 150000,
    max_mp: 150000,
    // 攻略：杀不杀都不影响进度（建议留着刷祝融），所以不计分
    score: 0,
    gj: 42000,
    fy: 30000,
    mz: 45000,
    ds: 32000,
    zj: 900
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2010],
    ["parry", 2010],
    ["force", 2010],
    ["unarmed", 2010]);
// 天龙寺困难模式要用阿朱的易容面具（sp/azhu_mask），继续在这里出售
this.set_goods("sp/azhu_mask");
this.set_drop({
    obj: ["eq/lv4/yirongmianju"],
    odds: 3960
});

// 攻略：建议留着阿朱，在内堂与她「切磋」（比试）刷五神剑的祝融 buff。
//   比试到一方气血低于三成即止，不伤性命；阿朱脱战后会很快恢复，可以反复切磋。
this.on_before_fight = function (me) {
    if (!me || !me.is_player) return true;
    me.notify("阿朱抿嘴一笑：「好呀，公子爷不在家，正闷得慌，陪你过几招。可不许当真哦。」");
    return true;
};
this.on_fight_over = function (target, win) {
    if (!target || !target.is_player) return;
    target.notify(win ? "阿朱拍手笑道：「承让啦！再来再来。」" : "阿朱吐了吐舌头：「好厉害，我认输。歇一会儿再陪你玩。」");
};
this.on_kill = function (me) {
    if (me && me.is_player) me.notify("阿朱花容失色：「你……你要杀我？」");
    return true;
};
