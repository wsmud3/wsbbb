this.inherits(NPC);
this.set({
    name: "费斌",
    desc: "嵩山派的大弟子，身材高大，满脸横肉，一双三角眼透出凶光。他奉左冷禅之命来此监视衡山派，武功高强，剑法狠辣，是嵩山派十三太保之一。此人最是心狠手辣，下手从不留情。",
    title: "<hir>嵩山十三太保</hir>",
    gender: 1,
    age: 38,
    hp: 289000,
    max_hp: 289000,
    mp: 94600,
    max_mp: 94600,
    score: 0,                 // 完成度由本文件的 on_die 结算，不走 NPC score
    gj: 20859,
    fy: 11264,
    mz: 18241,
    ds: 11622,
    zj: 1013
});
this.set_objects([
    "eq/lv2/lm_cloth", 1, 1,
    "eq/lv2/lm_tou", 1, 1,
    "eq/lv2/lm_shoes", 1, 1,
    "eq/lv2/lm_pifeng", 1, 1,
    "eq/lv2/lm_jian", 1, 1
]);
this.skill_map(
    ["dodge", 1420],
    ["parry", 1420],
    ["force", 1420],
    ["unarmed", 1420],
    ["sword", 1420],
    ["songshanjianfa", 1420], ["parry", 1420, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 30,
    max: 70
}, {
    obj: ["book/bc#songshanjianfa"],
    odds: 7450
}, {
    obj: ["eq/lv2/lm_cloth", "eq/lv2/lm_tou", "eq/lv2/lm_shoes", "eq/lv2/lm_pifeng", "eq/lv2/lm_jian"],
    odds: 4470
});

// 原版机制（攻略第 15 节）：费斌是来杀刘正风的，不是来杀玩家的。
// 玩家要趁刘正风还没被打死，先把费斌解决掉。
this.on_enter = function (me) {
    if (!me || !me.is_player) return;
    var room = this.environment;
    var lz = null;
    if (room && room.items) {
        for (var i = 0; i < room.items.length; i++) {
            var o = room.items[i];
            if (o && o.path === "hs2/liuzhengfeng" && o.hp > 0) { lz = o; break; }
        }
    }
    if (lz) {
        me.notify("费斌狞笑道：刘正风，你勾结魔教，左盟主有令——格杀勿论！说罢挺剑直取刘正风。");
        this.do_kill(lz);
        return;
    }
    me.notify("费斌狞笑道：刘正风已经伏诛，既然你来了，也一并受死吧！");
    this.do_kill(me);
};

// 结算：刘正风还活着 → 160（100%）；刘正风先死 → 159（99%）
this.on_die = function (me) {
    if (!me || !me.is_player) return true;
    var failed = !!me.query_temp("hs2_lz_dead");
    me.add_fbscore(failed ? 159 : 160);
    if (failed)
        me.notify("<red>费斌伏诛，可刘正风已经先一步毙命……这一趟终究没能救出他。</red>");
    else
        me.notify("<hig>费斌伏诛！刘正风长出一口气：多谢壮士相救！</hig>");
    return true;
};
