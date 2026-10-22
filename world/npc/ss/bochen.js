this.inherits(NPC);
this.set({
    name: "卜沉",
    desc: "卜沉乃嵩山派十三太保之一，沉默寡言，剑法却极为狠辣。",
    title: "嵩山派太保",
    gender: 1,
    age: 41,
    hp: 85500,
    max_hp: 85500,
    mp: 27750,
    max_mp: 27750,
    score: 55,
    gj: 10638,
    fy: 4462,
    mz: 7506,
    ds: 5928,
    zj: 1050
});
this.set_objects([
    "eq/lv0/cloth", 1, 1,
    "eq/lv4/jian", 1, 1
]);
this.skill_map(
    ["dodge", 1176],
    ["parry", 1176],
    ["force", 1176],
    ["unarmed", 1176],
    ["sword", 1076],
    ["literate", 992],
    ["songshanjianfa", 1076, "sword"],    ["songshanquanfa", 1176, "unarmed"],);
this.set_drop({
    obj: "money/silver",
    min: 20,
    max: 50
}, {
    obj: ["book/bc#songshanjianfa"],
    odds: 7800
}, {
    obj: ["eq/lv4/jian"],
    odds: 4680
});
this.on_enter = function (me) {
    me.notify("卜沉一言不发，拔剑便刺！");
    this.do_kill(me);
};

this.on_died = function (killer, corpse) {
    if (!killer || !killer.is_player) return;
    var room = this.environment;
    if (!room || !room.spawn_wave) return;
    var alive = 0;
    for (var i = 0; i < room.items.length; i++) {
        var o = room.items[i];
        if (o && o.path && o.path.indexOf("ss/") === 0 && o.hp > 0 && o !== this &&
            ["ss/dengbagong", "ss/shatianweng", "ss/tangyinge", "ss/bochen"].indexOf(o.path) >= 0) alive++;
    }
    if (alive > 0) return;
    var w = killer.query_temp("ss_wave") || 1;
    if (w >= 4) {
        killer.remove_temp("ss_wave");
        killer.notify("<hiy>四波太保全部伏诛，会盟堂的左冷禅等着你了。</hiy>");
        return;
    }
    w += 1;
    killer.set_temp("ss_wave", w, 7200000);
    room.spawn_wave(killer, w);
};
