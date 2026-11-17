this.inherits(NPC);
this.set({
    name: "邓八公",
    desc: "邓八公乃嵩山派十三太保之一，辈分极高，剑法老辣。",
    title: "嵩山派太保",
    gender: 1,
    age: 52,
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
    "eq/lv0/jian", 1, 1
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
    odds: 3000
}, {
    obj: ["eq/lv0/jian"],
    odds: 4680
});
this.on_enter = function (me) {
    me.notify("邓八公捋须道：老夫镇守中门多年，休想轻易通过！");
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
    var w = room.query_temp(killer, "ss_wave") || 1;
    if (w >= 4) {
        room.set_temp(killer, "ss_wave", 5);   // 四波打完记为完成（原先删掉标记，回头进中门会从第一波重刷）
        killer.notify("<hiy>四波太保尽数伏诛。会盟堂上，左冷禅已在等你。</hiy>");
        return;
    }
    w += 1;
    room.set_temp(killer, "ss_wave", w);
    room.spawn_wave(killer, w);
};
