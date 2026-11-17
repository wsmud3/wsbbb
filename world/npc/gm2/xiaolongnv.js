this.inherits(NPC);
this.set({
    name: "小龙女",
    desc: "古墓派传人，一袭白衣如雪，清冷脱俗。玉女剑法出神入化，银索金铃独步武林。",
    title: "<hiy>古墓仙子</hiy>",
    gender: 2,
    age: 22,
    per: 30,
    hp: 5362000,
    max_hp: 5362000,
    mp: 658000,
    max_mp: 658000,
    score: 85,
    gj: 135737,
    fy: 72750,
    mz: 148958,
    ds: 84000,
    zj: 1227
});
this.set_objects(["eq/lv0/cloth", 1, 1]);
this.skill_map(
    ["dodge", 4375],
    ["parry", 4525],
    ["force", 4650],
    ["sword", 4375],
    ["whip", 4650],
    ["yunvxinjing", 4650, "force"],
    ["yinsuojinling", 4650, "whip"]
);
this.set_drop(
    {obj: "money/silver", min: 30, max: 300},
    {obj: ["book/bc#yunvxinjing"], odds: 3000},
    {obj: ["book/bc#yinsuojinling"], odds: 3000},
    {obj: ["eq/lv4/jinlingsuo"], odds: 100}
);
// 攻略第 30 节：弹琴后才出现，不主动出手；可以比试。
// 「比试到剩一滴血 → 叫杀 → 凌波溜 → 死了复活 → 干掉小龙女」：她受伤后不会自行回血。
// 对她叫杀，杨过会来帮手；她死后杨过拼命（杨过只能打昏，见 yangguo.js）。
this.on_enter = function (me) { };
this.on_before_fight = function (me) {
    if (me && me.is_player) this.gm2_hurt = true;
    return true;
};
this.on_kill = function (me) {
    if (!me || !me.is_player) return true;
    this.gm2_hurt = true;
    var room = this.environment;
    var yg = room && room.find_obj_bypath && room.find_obj_bypath("gm2/yangguo");
    if (yg && yg.hp > 0 && !yg.is_fighting(me)) {
        // 稍后再加入：玩家的出手目标是敌人列表第一位，杨过若抢在前面，玩家会一直砍杀不死的杨过
        yg.call_out(function () {
            if (yg.hp <= 0 || !me.environment || yg.environment !== me.environment || me.hp <= 0) return;
            if (yg.environment.send_room) yg.environment.send_room("<hiy>杨过喝道：「休伤龙儿！」挺身挡在小龙女身前。</hiy>");
            yg.do_kill(me);
        }, 1500);
    }
    return true;
};
// 古墓寒气：交过手之后不会自行回血（NPC 默认脱战每 5 秒回一半血）
this.heart_beat = function (dt) {
    if (this.gm2_hurt && !this.fight_type && this.hp > 0) {
        if (this.mp < this.max_mp) this.add_mp(parseInt(this.max_mp / 2));
        return;
    }
    return NPC.prototype.heart_beat.call(this, dt);
};
this.on_died = function (killer) {
    var room = this.environment;
    var yg = room && room.find_obj_bypath && room.find_obj_bypath("gm2/yangguo");
    if (!yg || yg.hp <= 0) return;
    room.send_room("<hir>杨过悲呼一声「龙儿！」，双目尽赤，黯然销魂掌向你当胸拍来！</hir>");
    for (var i = 0; i < room.items.length; i++) {
        var p = room.items[i];
        if (p && p.is_player && p.hp > 0) yg.do_kill(p);
    }
};
