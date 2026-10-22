this.inherits(NPC);
this.set({
    name: "刘正风",
    desc: "衡山派的二当家，面容清隽，气度儒雅，颇有长者之风。他精通音律，以琴入剑，是衡山派的第一高手。刘正风为人正直，淡泊名利，一心只想金盆洗手退出江湖，却身不由己被卷入一场巨大的阴谋之中。",
    title: "<hgr>衡山派二当家</hgr>",
    gender: 1,
    age: 48,
    per: 30,
    hp: 132600,
    max_hp: 132600,
    mp: 53000,
    max_mp: 53000,
    score: 0,
    gj: 16065,
    fy: 7480,
    mz: 12835,
    ds: 8284,
    zj: 810
});
this.set_objects([
    "eq/lv2/hs_qin", 1, 1,
    "eq/lv1/lm_cloth", 1, 1,
    "eq/lv1/lm_shoes", 1, 1
]);
this.skill_map(
    ["dodge", 1352],
    ["parry", 1352],
    ["force", 1352],
    ["unarmed", 1352],
    ["sword", 1352],
    ["hengshanshenfa", 1352, "dodge"],    ["hengshanjianfa", 1352], ["parry", 1352, "sword"]);

this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
}, {
    obj: ["book/bc#hengshanjianfa", ],
    odds: 7450
}, {
    obj: ["eq/lv2/hs_qin"],
    odds: 4470
});
this.on_enter = function (me) {
    me.notify("刘正风看到你，微微颔首：阁下是来助我刘家脱困的么？费斌那厮就在堂上，请壮士速速出手！");
    // Friendly - does not attack
};

// 原版机制（攻略第 15 节）：救出刘正风——在刘正风死之前击杀费斌即可通关。
// 若刘正风先死，费斌未除，则本关失败。
this.on_died = function (killer, corpse) {
    var room = this.die_room || this.environment;
    if (!room) return;
    var feibin = null;
    for (var i = 0; i < room.items.length; i++) {
        var o = room.items[i];
        if (o && o.path === "hs2/feibin" && o.hp > 0) { feibin = o; break; }
    }
    if (feibin) {
        room.send_room("<hir>刘正风倒下了……费斌还没死，这一趟救不出他了。</hir>");
        if (killer && killer.is_player) {
            killer.remove_temp("hs2_rescue");
            killer.notify("<red>刘正风已死而费斌未除，本次营救失败。</red>");
        }
    } else {
        room.send_room("<hig>刘正风长出一口气：多谢壮士相救！</hig>");
    }
};
