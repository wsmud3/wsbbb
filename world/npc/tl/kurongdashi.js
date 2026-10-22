this.inherits(NPC);
this.set({
    name: "枯荣大师",
    desc: "天龙寺第一高僧，枯荣禅功已臻化境，面容半枯半荣，佛法武功皆深不可测。",
    title: "<hiy>枯荣大师</hiy>",
    gender: 1,
    age: 80,
    per: 8,
    hp: 1494000,
    max_hp: 1494000,
    mp: 202500,
    max_mp: 202500,
    score: 95,
    gj: 93600,
    fy: 57648,
    mz: 92400,
    ds: 49752,
    zj: 2800
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 2480],
    ["parry", 2568],
    ["force", 2912],
    ["unarmed", 2912],
    ["kumushengong", 2912, "force"],
    ["liumaishenjian", 2480, "unarmed"]
);
this.set_drop(
    {obj: "money/silver", min: 40, max: 400},
    {obj: ["book/bc#kumushengong"], odds: 12000},
    {obj: ["book/bc#liumaishenjian"], odds: 12000},
    {obj: ["eq/lv5/wushen/longgu_jewels"], odds: 7200}
);
this.on_enter = function (me) {
    if (!me.is_player) return;
    if (me.query_temp('tl_carry_duanyu')) {
        me.notify("枯荣大师半枯半荣的面容终于动容：「放下段誉！」六脉神剑的无形剑气已向你袭来！"); this.do_kill(me);
    } else {
        me.notify("枯荣大师正在入定，半枯半荣的面容毫无表情。");
    }
};
this.on_die = function(killer) { if (killer && killer.is_player) killer.set_temp('tl_killed_any', 1); };
// 心跳检测：同房间有背负段誉的玩家就主动开杀
this.on_heart_beat = function() {
    if (this.hp <= 0 || !this.environment) return;
    var room = this.environment;
    for (var i = 0; i < room.items.length; i++) {
        var p = room.items[i];
        if (p && p.is_player && p.query_temp('tl_carry_duanyu') && !p.query_enemy_of(this)) {
            this.do_kill(p);
        }
    }
};
